/**
 * Created by caiw on 11/8/15.
 */
var cubeView = {
    isCubeViewOn:false,

    init:function(){
        var me = this;
        $("body").append("<div class='cubeviewSwitchBtn'>CubeViewSwitchBtn</div>");
        $(".cubeviewSwitchBtn").click(function(){
            me.toggle();
        });
    },

    toggle:function(){
        this.isCubeViewOn = !this.isCubeViewOn;
        this.update();
    },

    update:function(){
        console.log("cubeview status: " + this.isCubeViewOn);
    }


}