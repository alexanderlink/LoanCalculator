sap.ui.define([
   "sap/ui/core/mvc/Controller",
   "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
   "use strict";
   return Controller.extend("de.alxsoft.controller.App", {
      onInit : function () {
         // set data model on view
         var oData = {
            recipient : {
               name : "WorldX"
            },
            mytable: [
                { name: "Test", id: "sefsdf"},
                { name: "Test2", id: "sdfsdf"}
            ]
         };
         var oModel = new JSONModel(oData);
         this.getView().setModel(oModel);
      },
      onShowHello : function () {
         // show a native JavaScript alert
         alert("Hello World");
      }
   });
});