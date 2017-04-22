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
            input: {
                darlehnsbetrag: 70000,
                sollzins: 1.1,
                zinsbindung: 10,
                anfangstilgung: 3.0,
                alter: 36,
                sollzinsBetrag: 0,
                anfangstilgungBetrag: 0,
                rateJahr: 0,
                rateMonat: 0,
                zinsSumme: 0,
                tilgungSumme: 0,
                summeAlles: 0,
                restSchuld: 0,
                alterZinsBindung: 0
            },
            mytable: [
                {                    name: "Test",                    id: "sefsdf"                },
                { name: "Test2", id: "sdfsdf"}
            ]
         };
         var oModel = new JSONModel(oData);
         this.getView().setModel(oModel);
      },
      onShowHello : function () {
         // show a native JavaScript alert
         alert("Hello World");
      },
      calculate: function() {
        var model = this.getView().getModel();
		var darlehnsbetrag = model.getProperty('/input/darlehnsbetrag');
		var sollzins = model.getProperty('/input/sollzins') / 100;
		var anfangstilgung = model.getProperty('/input/anfangstilgung') / 100;
		var zinsbindung = model.getProperty('/input/zinsbindung');
		var alter = model.getProperty('/input/alter');
		
		var sollzinsBetrag = darlehnsbetrag * sollzins;
		var anfangstilgungBetrag = darlehnsbetrag * anfangstilgung;
		var rateJahr = sollzinsBetrag + anfangstilgungBetrag;
		var rateMonat = rateJahr / 12;
		var alterZinsBindung = 1*alter+ 1*zinsbindung;

		model.setProperty('/input/sollzinsBetrag', sollzinsBetrag);
		model.setProperty('/input/anfangstilgungBetrag', anfangstilgungBetrag);
		model.setProperty('/input/rateJahr', rateJahr);
		model.setProperty('/input/rateMonat', rateMonat);
		model.setProperty('/input/alterZinsBindung', alterZinsBindung);


		var zinsSumme = 0;
		var tilgungSumme = 0;
		var restSchuld = 0;
		
		var data = [{restSchuld: darlehnsbetrag}];
		for(var i = 1; i <= zinsbindung * 12; i++) {
			var prev = data[i-1];
			var next = {};
			data[i] = next;
			next.zinsen = prev.restSchuld * sollzins / 12;
			next.tilgung = rateMonat - next.zinsen;
			if(next.tilgung > prev.restSchuld) next.tilgung = prev.restSchuld;
			next.restSchuld = prev.restSchuld - next.tilgung;
			restSchuld = next.restSchuld;
			zinsSumme += next.zinsen;
			tilgungSumme += next.tilgung;
			//$('#table').html($('#table').html() + next.zinsen + '|' + next.tilgung + '|' + next.restSchuld + '<br>');
		}

		model.setProperty('/input/zinsSumme', zinsSumme);
		model.setProperty('/input/tilgungSumme', tilgungSumme);
		var summeAlles = zinsSumme + tilgungSumme;
		model.setProperty('/input/summeAlles', summeAlles);
		model.setProperty('/input/restSchuld', restSchuld);
		
		/*
		var dataYear = [];
		dataYear[0] = {zinsen: 0, tilgung: 0, restSchuld: darlehnsbetrag};
		$('#table').html($('#table').html() + 'Year | Zinsen | Tilgung | Rest<br>');
		for(var y = 0; y < zinsbindung; y++) {
			var zinsen = 0;
			var tilgung = 0;
			var rest = data[y*12 + 12].restSchuld;
			for(var m = y*12 + 1; m <= y*12 + 12; m++) {
				zinsen += data[m].zinsen;
				tilgung += data[m].tilgung;
			}
			dataYear[y+1] = {zinsen: zinsen, tilgung: tilgung, restSchuld: rest};
			//$('#table').html($('#table').html() + (y<9?'0':'') + (y+1) + ' | ' + zinsen.toFixed(2) + ' € | ' + tilgung.toFixed(2) + ' € | ' + rest.toFixed(2) + ' €<br>');
			if(rest <= 0) break;
		}
		
		_scope.dataYear = dataYear;
		_scope.$apply();
        */
      }

   });
});