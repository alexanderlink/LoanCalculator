sap.ui.define([
   "sap/ui/core/mvc/Controller",
   "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
   "use strict";
   return Controller.extend("de.alxsoft.controller.App", {
      onInit : function () {
         // set data model on view
         var oData = {
			tabs: [
				{
					tabTitle: 'Overview', 
					index: 0
				},
				{
					tabTitle: 'Darlehn',
					index: 1,
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
				}
				/*
				, dataYear: [
					{year: '', zinsen: 0, tilgung: 0, restSchuld: 0}
				]
				*/
			},
			{
					tabTitle: 'Darlehn',
					index: 2,
				input: {
					darlehnsbetrag: 80000,
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
				}
				/*
				, dataYear: [
					{year: '', zinsen: 0, tilgung: 0, restSchuld: 0}
				]
				*/
			}]
         };
         var oModel = new JSONModel(oData);
         this.getView().setModel(oModel);
		 var _this = this;
         setTimeout(function() {
			 _this.calculate();
		 }, 1);
      },
      calculate: function(element) {
		if(!element) {
			var model = this.getView().getModel();
			var tabs = model.getProperty('/tabs');
			var _this = this;
			tabs.forEach(function(tab) {
				_this._calculate(tab);
			});
			this._collectOverview();
		} else {
			var elemName = element.getSource().getId();
			var id = parseInt(elemName.substring(elemName.indexOf('myTabContainer') + 15)); //"__input0-view1--myTabContainer-0"
			var model = this.getView().getModel();
			var tabs = model.getProperty('/tabs');
			this._calculate(tabs[id]);
		}
		model.refresh(true);
	  },
	  _calculate: function(model) {
		if(model.index <= 0) return;
		var darlehnsbetrag = model.input.darlehnsbetrag * 1;
		var sollzins = model.input.sollzins / 100;
		var anfangstilgung = model.input.anfangstilgung / 100;
		var zinsbindung = model.input.zinsbindung * 1;
		var alter = model.input.alter * 1;
		
		var sollzinsBetrag = darlehnsbetrag * sollzins;
		var anfangstilgungBetrag = darlehnsbetrag * anfangstilgung;
		var rateJahr = sollzinsBetrag + anfangstilgungBetrag;
		var rateMonat = rateJahr / 12;
		var alterZinsBindung = 1*alter+ 1*zinsbindung;

		model.input.sollzinsBetrag = sollzinsBetrag;
		model.input.anfangstilgungBetrag = anfangstilgungBetrag;
		model.input.rateJahr = rateJahr;
		model.input.rateMonat = rateMonat;
		model.input.alterZinsBindung = alterZinsBindung;


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

		model.input.zinsSumme = zinsSumme;
		model.input.tilgungSumme = tilgungSumme;
		var summeAlles = zinsSumme + tilgungSumme;
		model.input.summeAlles = summeAlles;
		model.input.restSchuld = restSchuld;
		
		model.tabTitle = '' + darlehnsbetrag;
		
		var dataYear = [];
		dataYear[0] = {year: '', zinsen: 0, tilgung: 0, restSchuld: darlehnsbetrag};
		for(var y = 0; y < zinsbindung; y++) {
			var zinsen = 0;
			var tilgung = 0;
			var rest = data[y*12 + 12].restSchuld;
			for(var m = y*12 + 1; m <= y*12 + 12; m++) {
				zinsen += data[m].zinsen;
				tilgung += data[m].tilgung;
			}
			dataYear[y+1] = {year: y+1, zinsen: zinsen, tilgung: tilgung, restSchuld: rest};
			if(rest <= 0) break;
		}
        model.dataYear = dataYear;
      },


	  _collectOverview: function() {
		var model = this.getView().getModel();
		var tabs = model.getProperty('/tabs');
		var main = tabs[0];
		main.input = {
			darlehnsbetrag: 0,
			sollzinsBetrag: 0,
			anfangstilgungBetrag: 0,
			rateJahr: 0,
			rateMonat: 0,
			zinsSumme: 0,
			tilgungSumme: 0,
			summeAlles: 0,
			restSchuld: 0
		};
		tabs.forEach(function(tab) {
			if(tab.index > 0) {
				main.input.darlehnsbetrag += tab.input.darlehnsbetrag;
				main.input.sollzinsBetrag += tab.input.sollzinsBetrag;
				main.input.anfangstilgungBetrag += tab.input.anfangstilgungBetrag;
				main.input.rateJahr += tab.input.rateJahr;
				main.input.rateMonat += tab.input.rateMonat;
				main.input.zinsSumme += tab.input.zinsSumme;
				main.input.tilgungSumme += tab.input.tilgungSumme;
				main.input.summeAlles += tab.input.summeAlles;
				main.input.restSchuld += tab.input.restSchuld;
			}
		});
	  }

   });
});