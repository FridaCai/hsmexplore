/*****************************************************************************/
/* Copyright (c) 2013 Autodesk, Inc.                                         */
/* All rights reserved.                                                      */
/*                                                                           */
/* These coded instructions, statements, and computer programs contain       */
/* unpublished proprietary information written by Autodesk, Inc., and are    */
/* protected by Federal copyright law. They may not be disclosed to third    */
/* parties or copied or duplicated in any form, in whole or in part, without */
/* the prior written consent of Autodesk, Inc.                               */
/*****************************************************************************/

/**
*
* @author       Roc Wu
* @version	1.0
* @date		Feb 13, 2014
* @description  This file is part of Homestyler Web new floorplan editor.
* @file
*
*/
hsw = {};
hsw.view = hsw.view || {};
hsw.view.webgl3d = hsw.view.webgl3d || {};
hsw.view.webgl3d.material = hsw.view.webgl3d.material || {};


hsw.view.webgl3d.material.DecryptLambertMaterial = (function () {


    var map_fragment_ShaderChunk = [
        "#ifdef USE_MAP",

        "vec4 texelColor = texture2D( map, vUv );",

        // original:    R     G     B    A
        // encrypted: 255-B 255-R 255-G  A
        "texelColor.brg = texelColor.rgb;",
        "texelColor.r = 1.0 - texelColor.r;",
        "texelColor.g = 1.0 - texelColor.g;",
        "texelColor.b = 1.0 - texelColor.b;",

        "#ifdef GAMMA_INPUT",

        "texelColor.xyz *= texelColor.xyz;",

        "#endif",

        "gl_FragColor = gl_FragColor * texelColor;",

        "#endif"
    ].join("\n");

    var lambertShader = null;
    var fragmentShader = null;

    var initShaders = function () {
        // comes from 'lambert' shader
        lambertShader = THREE.ShaderLib['lambert'];
        // plese refer to THREE.ShaderLib.lambert for following shader code
        fragmentShader = [

            "uniform float opacity;",

            "varying vec3 vLightFront;",

            "#ifdef DOUBLE_SIDED",

            "varying vec3 vLightBack;",

            "#endif",

            THREE.ShaderChunk[ "color_pars_fragment" ],
            THREE.ShaderChunk[ "map_pars_fragment" ],
            THREE.ShaderChunk[ "lightmap_pars_fragment" ],
            THREE.ShaderChunk[ "envmap_pars_fragment" ],
            THREE.ShaderChunk[ "fog_pars_fragment" ],
            THREE.ShaderChunk[ "shadowmap_pars_fragment" ],
            THREE.ShaderChunk[ "specularmap_pars_fragment" ],

            "void main() {",

            "gl_FragColor = vec4( vec3 ( 1.0 ), opacity );",

            map_fragment_ShaderChunk, // replace with customized shader chunk
            THREE.ShaderChunk[ "alphatest_fragment" ],
            THREE.ShaderChunk[ "specularmap_fragment" ],

            "#ifdef DOUBLE_SIDED",

            //"float isFront = float( gl_FrontFacing );",
            //"gl_FragColor.xyz *= isFront * vLightFront + ( 1.0 - isFront ) * vLightBack;",

            "if ( gl_FrontFacing )",
            "gl_FragColor.xyz *= vLightFront;",
            "else",
            "gl_FragColor.xyz *= vLightBack;",

            "#else",

            "gl_FragColor.xyz *= vLightFront;",

            "#endif",

            THREE.ShaderChunk[ "lightmap_fragment" ],
            THREE.ShaderChunk[ "color_fragment" ],
            THREE.ShaderChunk[ "envmap_fragment" ],
            THREE.ShaderChunk[ "shadowmap_fragment" ],

            THREE.ShaderChunk[ "linear_to_gamma_fragment" ],

            THREE.ShaderChunk[ "fog_fragment" ],

            map_fragment_lightShader,
            "}"

        ].join("\n");
    };

    return function () {
        if (!lambertShader) {
            initShaders();
        }

        var uniforms = THREE.UniformsUtils.clone(lambertShader.uniforms);

        var material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: lambertShader.vertexShader,
            fragmentShader: fragmentShader,
            lights: true,
            fog: true
        });

        material.map = true; // for triggering the #define in three.js lib
        return material;
    };
})();

//# sourceURL=/hsw.view.webgl3d.material.DecryptLambertMaterial
