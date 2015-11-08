var util = {
    getParamByKey: function(key){
        var result = location.search.match(new RegExp("[\?\&]" + key + "=([^\&]+)", "i"));
        if (result == null || result.length < 1) {
            return "";
        }
        return result[1];
    },

    biasedSign:function(v){
        if(v >=0)
            return 1;
        return -1;
    },

    between: function(low, high, value){
      return Math.max(low, Math.min(high, value));
    },

    getCubeVerts:function(data){
        var CUBE_DEPTH = 80;

        var upperLeft = new THREE.Vector3(data[0].x, data[0].y, data[0].z);
        var upperRight = new THREE.Vector3(data[1].x, data[1].y, data[1].z);
        var lowerRight = new THREE.Vector3(data[2].x, data[2].y, data[2].z);
        var lowerLeft = new THREE.Vector3(data[3].x, data[3].y, data[3].z);

        var sb1 = new THREE.Vector3().subVectors(lowerLeft, upperLeft);
        var sb2 = new THREE.Vector3().subVectors(upperRight, upperLeft);
        var back = new THREE.Vector3().cross(sb1, sb2).normalize();

        var maxDepth = Math.max(Math.abs(lowerRight.z), Math.abs(lowerLeft.z));
        maxDepth = Math.max(maxDepth, CUBE_DEPTH);
        back = back.multiplyScalar(maxDepth);

        var backUpperLeft = upperLeft.add(back);
        var backUpperRight = upperRight.add(back);
        var backLowerRight = lowerRight.add(back);
        var backLowerLeft = lowerLeft.add(back);

        return [backUpperLeft.x, backUpperLeft.y, backUpperLeft.z,
            backUpperRight.x, backUpperRight.y, backUpperRight.z,
            backLowerRight.x, backLowerRight.y, backLowerRight.z,
            backLowerLeft.x, backLowerLeft.y, backLowerLeft.z,
            upperLeft.x, upperLeft.y, upperLeft.z,
            upperRight.x, upperRight.y, upperRight.z,
            lowerRight.x, lowerRight.y, lowerRight.z,
            lowerLeft.x, lowerLeft.y, lowerLeft.z]
    },


    getVectorForVertex: function(cubeVerts, index) {
        return {
            x: cubeVerts[index * 3],
            y: cubeVerts[index * 3 + 1],
            z: cubeVerts[index * 3 + 2]
        }
    },

    GLKMatrix3MakeRotation:function(radians, x, y, z){
        var v = (new THREE.Vector3(x, y, z)).normalize();
        var cos = Math.cos(radians);
        var cosp = 1 - cos;
        var sin = Math.sin(radians);

        var m = new THREE.Matrix3();
        m.set(cos + cosp * v.x * v.x,
                cosp * v.x * v.y + v.z * sin,
                cosp * v.x * v.z - v.y * sin,

                cosp * v.x * v.y - v.z * sin,
                cos + cosp * v.y * v.y,
                cosp * v.y * v.z + v.x * sin,

                cosp * v.x * v.z + v.y * sin,
                cosp * v.y * v.z - v.x * sin,
                cos + cosp * v.z * v.z);
        return m;
    },

    GLKMatrix3Multiply:function(a, b){
        var ae = a.elements;
        var be = b.elements;

        var matrix = new THREE.Matrix3();
        matrix.set(ae[0] * be[0] + ae[3] * be[1] + ae[6] * be[2],
                ae[1] * be[0] + ae[4] * be[1] + ae[7] * be[2],
                ae[2] * be[0] + ae[5] * be[1] + ae[8] * be[2],
                ae[0] * be[3] + ae[3] * be[4] + ae[6] * be[5],
                ae[1] * be[3] + ae[4] * be[4] + ae[7] * be[5],
                ae[2] * be[3] + ae[5] * be[4] + ae[8] * be[5],
                ae[0] * be[6] + ae[3] * be[7] + ae[6] * be[8],
                ae[1] * be[6] + ae[4] * be[7] + ae[7] * be[8],
                ae[2] * be[6] + ae[5] * be[7] + ae[8] * be[8]);

        return matrix;
    },
    GLKMatrix4MakeYRotation: function(radians){
        var cos = Math.cos(radians);
        var sin = Math.sin(radians);

        var matrix = new THREE.Matrix4();
        matrix.set(
            cos, 0.0, -sin, 0.0,
            0.0, 1.0, 0.0, 0.0,
            sin, 0.0, cos, 0.0,
            0.0, 0.0, 0.0, 1.0);
        return matrix;
    },
    GLKMatrix3MakeXRotation:function(radians){
        var cos = Math.cos(radians);
        var sin = Math.sin(radians);

        var matrix = new THREE.Matrix3();
        matrix.set(1.0, 0.0, 0.0,
            0.0, cos, sin,
            0.0, -sin, cos );
        matrix = matrix.transpose();
        return matrix;
    },
    GLKMatrix3RotateX: function(matrix, radians){
        var rm = this.GLKMatrix3MakeXRotation(radians);
        return this.GLKMatrix3Multiply(matrix, rm);
    },
    GLKMatrix4Translate:function(matrix, tx, ty, tz){
        var m = new THREE.Matrix4();
        m.set( matrix.elements[0], matrix.elements[1], matrix.elements[2], matrix.elements[3],
            matrix.elements[4], matrix.elements[5], matrix.elements[6], matrix.elements[7],
            matrix.elements[8], matrix.elements[9], matrix.elements[10], matrix.elements[11],
            matrix.elements[0] * tx + matrix.elements[4] * ty + matrix.elements[8] * tz + matrix.elements[12],
            matrix.elements[1] * tx + matrix.elements[5] * ty + matrix.elements[9] * tz + matrix.elements[13],
            matrix.elements[2] * tx + matrix.elements[6] * ty + matrix.elements[10] * tz + matrix.elements[14],
            matrix.elements[15] );
        m = m.transpose();
        return m;
    }


}