/**
 * Created by caiw on 1/14/15.
 * load single content.
 * parse obj and texture.
 */

var contentManager = {
    loadContent:function(){
        var self = this;
        var manager = new THREE.LoadingManager();
        var loader = new THREE.OBJLoader(manager);

        var productId = contentManager.data.productId;

        var url = contentManager.modelUrl.replace("#seekId", contentManager.data.productId);

        var decrypt = function(txt){
            return txt; //for local model test


            var key = CryptoJS.MD5("firecracker" + productId);
            var iv = CryptoJS.MD5("adsk" + productId);
            var result = CryptoJS.AES.decrypt(txt, key, {iv: iv}).toString(CryptoJS.enc.Utf8);
            return result;
        };
        //loader.load(url, decrypt, function (object) {
        loader.load(url, function (object) {
            self.resolve(object);
        });
    },

    loadTexture:function(){
        var seekId = contentManager.data.productId;
        var url = contentManager.textureUrl.replace("#seekId", seekId);
        var texture = THREE.ImageUtils.loadTexture( url);
        this.resolve(texture);
    },

    load: function(){
        var self = contentManager;
        var scope = this;
        var modelData = self.data;

        $.when($.Deferred(self.loadContent), $.Deferred(self.loadTexture)).done(function(args){
            var object = arguments[0];
            var texture = arguments[1];

            object.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    var material = new THREE.MeshBasicMaterial({map: texture});
                    child.material = material;




                    //child.material = new THREE.MeshBasicMaterial( { wireframe: true } );
                    if(child.name.toLowerCase() == "shadow"){
                        child.material.transparent = true;
                    }
                }
            });
            scope.resolve(object, modelData);


        }).fail(function(){
            console.log("content load and texture load are all failed");
            scope.reject();
        });
    },

    init:function(data, sceneId){
        this.data = data;

        this.modelUrl = "content/#sceneId/obj/#seekId.obj".replace("#sceneId", sceneId).replace("#seekId", data.productId);
        this.textureUrl = "content/#sceneId/obj/#seekId.png".replace("#sceneId", sceneId).replace("#seekId", data.productId);
    }
}


