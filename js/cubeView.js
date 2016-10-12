/**
 * Created by caiw on 11/8/15.
 */
var cubeView = {
    isCubeViewOn:false,

    init:function(){
        var me = this;
        $("body").append("<div class='cubeviewSwitchBtn'>CubeViewSwitchBtn</div>"
            + "<ul>"
                + "<li>9707dc05-ecbc-4381-8ca8-e7a1e9ca1146</li>"
            + "</ul>");
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








