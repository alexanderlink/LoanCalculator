sap.ui.define([
   "sap/ui/core/mvc/Controller",
   "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
   "use strict";
   return Controller.extend("de.alxsoft.controller.LoanInput", {
      onInit : function () {
	  },
      calculate: function(e) {
          var appController = sap.ui.getCore().byId("AppView").getController();
          appController.calculate();
      }
   });
});