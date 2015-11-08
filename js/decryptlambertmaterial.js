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

    var fragmentShader = [
        "precision highp float;",
        "uniform vec3 diffuseColor;",
        "uniform sampler2D s_texture;",
        "varying vec2 ftexCoord;",
        "",
        "void main()",
        "{",
        " vec4 sample = texture2D(s_texture,ftexCoord);",
        "if(sample.a > 0.6)",
        "gl_FragColor = sample;",
        "else",
        "    discard;",
        "}"
    ].join("\n");

    var vertexShader = [
        "attribute vec3 position;",
        "attribute vec3 normal;",
        "attribute vec2 texCoord;",
        "uniform mat4 modelViewProjectionMatrix;",
        "varying vec2 ftexCoord;",
        "",
        "void main()",
        "{",
        " ftexCoord = texCoord;",
        "  gl_Position = modelViewProjectionMatrix * vec4(position, 1.0);",
        "}"
    ].join("\n");

    var initShaders = function () {
        // comes from 'lambert' shader
        lambertShader = THREE.ShaderLib['lambert'];

    };

    return function () {
        if (!lambertShader) {
            initShaders();
        }

        debugger;
        //todo: try uniforms
        var uniforms = THREE.UniformsUtils.clone(lambertShader.uniforms);

        var material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader,
            /*fragmentShader: fragmentShader,*/
            lights: true,
            fog: true
        });

        material.map = true; // for triggering the #define in three.js lib
        return material;
    };
})();

//# sourceURL=/hsw.view.webgl3d.material.DecryptLambertMaterial
