/**
 * Created by caiw on 1/13/15.
 */
var SIGNALS = signals;

var controller = {

    container: null,
    stats: null,
    camera: null,
    scene: null,
    renderer: null,
    cube: null,
    controls: null,

    sceneId: "",
    bg: "",
    jsonUrl: "",
    designdata: null,
    cubeVerts:null,
    cameraMatrix: null,

    transformControls:null,
    selected:null,
    objects:[],
    signals:null,

    init:function(){
        this.sceneId = util.getParamByKey("id");
        this.bg = "content/" + this.sceneId + "/screenshot.jpg";
        this.jsonUrl = "content/" + this.sceneId + "/design.txt";

        var self = this;
        $.ajax({
            dataType: "json",
            url: this.jsonUrl,
            success: function (data) {
                self.designdata = data;
                self.cubeVerts = util.getCubeVerts(self.designdata.cube);
                self.initScene();
                self.animate();

                self.cameraMatrix = self.calcCameraParam();
                self.loadContents();

                self.addTransformControl();
                self.signals = {
                    objectSelected: new SIGNALS.Signal()
                }
                self.signals.objectSelected.add( function ( object ) {
                    self.transformControls.detach();
                    if ( object !== null ) {
                        self.transformControls.attach( object );
                    }
                    self.animate();
                });

                cubeView.init();
            }
        });
    },
    addTransformControl: function(){
        var me = this;
        var raycaster = new THREE.Raycaster();
        var mouse = new THREE.Vector2();

        // events

        var getIntersects = function ( point, object ) {

            mouse.set( ( point.x * 2 ) - 1, - ( point.y * 2 ) + 1 );

            raycaster.setFromCamera( mouse, me.camera );

            if ( object instanceof Array ) {

                return raycaster.intersectObjects( object, true );

            }

            return raycaster.intersectObject( object );

        };

        var onDownPosition = new THREE.Vector2();
        var onUpPosition = new THREE.Vector2();

        var getMousePosition = function ( dom, x, y ) {
            var rect = dom.getBoundingClientRect();
            return [ ( x - rect.left ) / rect.width, ( y - rect.top ) / rect.height ];
        };

        var handleClick = function () {

            if ( onDownPosition.distanceTo( onUpPosition ) == 0 ) {

                var intersects = getIntersects( onUpPosition, me.objects );

                if ( intersects.length > 0 ) {

                    var object = intersects[ 0 ].object;
                    me.select( object );
                } else {
                    me.select( null );
                }

                me.animate();

            }

        };

        var onMouseDown = function ( event ) {

            event.preventDefault();

            var array = getMousePosition( me.renderer.domElement, event.clientX, event.clientY );
            onDownPosition.fromArray( array );

            document.addEventListener( 'mouseup', onMouseUp, false );

        };

        var onMouseUp = function ( event ) {

            var array = getMousePosition( me.renderer.domElement, event.clientX, event.clientY );
            onUpPosition.fromArray( array );

            handleClick();

            document.removeEventListener( 'mouseup', onMouseUp );

        };


        this.renderer.domElement.addEventListener( 'mousedown', onMouseDown);

        this.transformControls = new THREE.TransformControls( this.camera, this.renderer.domElement); //is dom ok?

        this.transformControls.addEventListener( 'change', function () {
        } );
        this.transformControls.addEventListener( 'mouseDown', function () {
        } );
        this.transformControls.addEventListener( 'mouseUp', function () {
        } );

        this.scene.add( this.transformControls );
    },

    select: function ( object ) {

        if ( this.selected === object ) return;

        var uuid = null;

        if ( object !== null ) {

            uuid = object.uuid;

        }

        this.selected = object;
        this.signals.objectSelected.dispatch( object );
    },
    calcCameraParam:function(){
        /*
        //very important! to test matrixhere.
        var m = new THREE.Matrix4();
        m.set(1, -0.001003, -0.000022, 0,
            0.001003, 0.999929, -0.011857, 0,
            0.000034, 0.011857, 0.999929, 0,
            -0.001565, -1.560069, 0.018499, 1
        );
        return m;
        */



        var matrix = this.dealWithRotMatrix();
        matrix = matrix.transpose();
        return matrix;
    },
    loadContents: function(){
        var self = this;
        for (var i = 0; i < this.designdata.models.length; i++) {
            var model = this.designdata.models[i];
            contentManager.init(model, self.sceneId);

            $.when($.Deferred(contentManager.load)).done(function(){
                var object = arguments[0];
                var modelData = arguments[1];

                self.scene.add(object);

                var scale = modelData.scale/100;
                var modelmatrix = new THREE.Matrix4();
                modelmatrix.set(
                    scale, 0, 0, 0,
                    0, scale, 0, 0,
                    0, 0, scale, 0,
                    modelData.x, modelData.y, modelData.z, 1
                );
                var modelrotatematrix = util.GLKMatrix4MakeYRotation(modelData.yRot);
                modelmatrix = new THREE.Matrix4().multiplyMatrices(modelrotatematrix, modelmatrix);

                var result = new THREE.Matrix4().multiplyMatrices(modelmatrix, self.cameraMatrix);
                result = result.transpose();

                object.applyMatrix(result);

               // self.transformControls.setMode("translate");
                self.transformControls.attach( object );
                self.selected = object;

                self.objects.push(object);
            }).fail(function(){
                console.log("oops. fail to load content");
            });
        }
    },
    cameraMatrix:function(){
        var rot = this.rotationMatrix.transpose();
        var radians = Math.PI / 2;
        rot = util.GLKMatrix3RotateX(rot, radians);// frida. turn back to json matrix
        rot = rot.transpose();











        var xzPlaneNormal = new THREE.Vector3(0, 1, 0);
        var  r = rot.clone();
        xzPlaneNormal.applyMatrix3(r);

        var yzPlaneNormal = new THREE.Vector3(this.gravity.y, -this.gravity.x, 0);
        yzPlaneNormal.normalize();
        var realFront = new THREE.Vector3();
        realFront.crossVectors(xzPlaneNormal, yzPlaneNormal).normalize();
        realFront.multiplyScalar(Math.sign(realFront.z));

        var rotatedFront = new THREE.Vector3(0, 0, 1);
        rotatedFront.applyMatrix3(r).normalize();

        var dv = new THREE.Vector3();
        dv.crossVectors(rotatedFront, realFront);
        var direction = dv.dot(xzPlaneNormal);

        var heading = Math.acos(util.between(-1, 1, rotatedFront.dot(realFront))) * util.biasedSign(direction);
        var fixRotation = util.GLKMatrix3MakeRotation(heading, xzPlaneNormal.x, xzPlaneNormal.y, xzPlaneNormal.z);
        fixRotation = fixRotation.transpose();

        rot = util.GLKMatrix3Multiply(fixRotation, rot);
        rot = rot.transpose();

        var tt = util.GLKMatrix3MakeRotation(Math.PI / 2, 0, 0, 1);
        tt = tt.transpose();
        rot = util.GLKMatrix3Multiply(tt, rot);
        rot = rot.transpose();

        return rot;
    },
    updateCamera: function(){
        var modelview = new THREE.Matrix4();
        var rot = new THREE.Matrix4();
        var m = this.cameraMatrix();

        var e = m.elements;
        var rot = new THREE.Matrix4();
        rot.set(
            e[0], e[1], e[2], 0,
            e[3], e[4], e[5], 0,
            e[6], e[7], e[8], 0,
            0, 0, 0, 1
        );

        modelview.multiplyMatrices(modelview, rot);
        modelview = modelview.transpose();

        var cameraHeight = this.getCameraHeight();
        modelview = util.GLKMatrix4Translate(modelview, 0, (-1)*cameraHeight, 0);
        return modelview;
    },

    dealWithRotMatrix: function(){
        this.designWithJSONDictionary();
        return this.updateCamera();
    },

    gravity: null,
    rotationMatrix: null,
    designWithJSONDictionary:function(){
        var m = this.designdata.matrix;

        var matrix = new THREE.Matrix3();
        matrix.set(m[0], m[1], m[2],
            m[4], m[5], m[6],
            m[8], m[9], m[10]);
        matrix = matrix.transpose();
        this.initWithCameraMatrix(matrix);
    },

    initWithCameraMatrix:function(matrix){
        this.gravity = matrix.multiplyVector3Array([0,-1,0]); //will matrix change after here?
        this.gravity = {
            x: this.gravity[0],
            y: this.gravity[1],
            z: this.gravity[2]
        }

        var radians = Math.PI / 2 * (-1);
        var m = util.GLKMatrix3RotateX(matrix, radians);
        this.rotationMatrix = m;
    },

    getCameraHeight:function(){
        //deal with cube verts.
        var DEFAULT_CAMERA_HEIGHT = 1.5;
        var d = this.designdata;
        if(this.cubeVerts && d.version == "1"){
            var floor = 2 * util.getVectorForVertex(this.cubeVerts, 3).y;
            var tmp = $.extend({}, this.cubeVers);
            tmp[2 * COORDS + Y] = tmp[3 * COORDS + Y] = tmp[6 * COORDS + Y] = tmp[7 * COORDS + Y] = floor;
            this.cubeVerts = tmp;
        }
        var  newFloor = this.cubeVerts ? util.getVectorForVertex(this.cubeVerts, 3).y : 0;
        if (this.designdata.version == "1") {
            newFloor *= 2;
        }
        return DEFAULT_CAMERA_HEIGHT - newFloor;
    },

    setRatio:function(){
        return 720/480;
    },

    setFOV: function(){
        var self = this;
        var getFOV = function(a, b, c, d, fov){
            with(THREE.Math){
                var angle = ((a / b)/(c / d)) * Math.tan(degToRad(fov / 2));
                return radToDeg(2 * Math.atan(angle));
            }
        };
        var test = function(){
            if(4/3 <= self.designdata.imageSize.Width / self.designdata.imageSize.Height)
                return true;
            else return false;
        }

        var DEFAULT_FOV = 62.70671;
        var RATIO = 2/3;

        var version = this.designdata.version;
        var newFov = this.designdata.cameraYFOV;

        var SCREEN_WIDTH = 720;
        var SCREEN_HEIGHT = 480;

        if(SCREEN_WIDTH / SCREEN_HEIGHT <= this.designdata.imageSize.Width / this.designdata.imageSize.Height){
            if(version <= 1.1 && test()) {
                newFov = getFOV(4, 3, this.designdata.imageSize.Width, this.designdata.imageSize.Height, this.designdata.cameraYFOV);
            }
        }else{
            if(version <= 1.1 ){
                if(test()){
                    newFov = getFOV(4,3,self.designdata.imageSize.Width, self.designdata.imageSize.Height, self.designdata.cameraYFOV);
                }
                newFov = getFOV(SCREEN_HEIGHT, SCREEN_WIDTH, self.designdata.imageSize.Height, self.designdata.imageSize.Width, newFov);

            }else{
                newFov = getFOV(SCREEN_HEIGHT, SCREEN_WIDTH, self.designdata.imageSize.Height, self.designdata.imageSize.Width, this.designdata.cameraYFOV);
            }
        }

        return newFov;
    },

    initScene: function() {
        $("body").append($("<div class='backgroundImg'/>"));
        $(".backgroundImg").css({
            background: 'url(' + this.bg + ') no-repeat',
            backgroundSize: "100%",
            width: "720px",
            height: "480px"
        });


        var ratio = this.setRatio();
        var fov = this.setFOV();
        this.camera = new THREE.PerspectiveCamera(fov, ratio, 0.1, 1000);

        this.scene = new THREE.Scene();

        var light = new THREE.DirectionalLight(0xffffff, 2);
        light.position.set(1, 1, 1).normalize();
        light.name = "light1";
        this.scene.add(light);

        this.renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});
        this.renderer.setSize(720, 480);


//no use.
        //this.renderer.shadowMapEnabled = true;
        //this.renderer.shadowMapType = THREE.PCFSoftShadowMap;
        //this.renderer.shadowMapCullFace = THREE.CullFaceNone;



        $(".backgroundImg").append($(this.renderer.domElement));

        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.top = '0px';
        $(".backgroundImg").append($(this.stats.domElement));
    },


    animate: function(){
        requestAnimationFrame(arguments.callee);
        controller.render();
        controller.stats.update();
    },
    render: function(){
        this.renderer.render(this.scene, this.camera);
    }
}