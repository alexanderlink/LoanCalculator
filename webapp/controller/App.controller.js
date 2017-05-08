sap.ui.define([
   "sap/ui/core/mvc/Controller",
   "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
   "use strict";
   return Controller.extend("de.alxsoft.controller.App", {
      onInit : function () {
         // set data model on view
		 var oGeneralData = {
			 currency: 'EUR'
		 }
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
         var oModelGeneral = new JSONModel(oGeneralData);
         this.getView().setModel(oModelGeneral, 'general');
         var oModel = new JSONModel(oData);
         this.getView().setModel(oModel);

         google.charts.load('current', {'packages':['corechart']});
    	 google.charts.setOnLoadCallback(
			new function(_this) {
				var _this = _this;
				var onInitGoogle = function() {
					var dummyData = google.visualization.arrayToDataTable([
					['Year', 'Sales', 'Expenses'],
					['2004',  1000,      400],
					['2005',  1170,      460],
					['2006',  660,       1120],
					['2007',  1030,      540]
					]);

					var options = {
						title: 'Loan Trend',
						curveType: 'none',
						legend: { position: 'bottom' }
					};

					var model = _this.getView().getModel();
					var tabs = model.getProperty('/tabs');
					tabs.forEach(function(tab) {
						var container = document.getElementById('curve_chart_' + tab.index);
						if(container) {
							tab.googleChart = new google.visualization.LineChart(container);
							tab.googleChart.draw(dummyData, options);
						}
					})
					
					_this.asyncInitCalculate(_this);
				};
				return onInitGoogle;
		 	}(this)
		 );

      },

	  tabSelected: function(e) {
		var tabName = e.getParameters().item.getName();
		var elemName = e.getParameters().item.getId();
		var id = parseInt(elemName.substring(elemName.indexOf('myTabContainer') + 15))
		this.calculate();
	  },

	  googleChartDraw: function(tab) {
		if(google.visualization) { //ready
			var options = {
				title: 'Loan Trend',
				curveType: 'none',
				legend: { position: 'bottom' }
			};
			var data2 = this.convertObjectArrayToArrayArray(tab.dataYear);
			var data2 = google.visualization.arrayToDataTable(data2);
			var container = document.getElementById('curve_chart_' + tab.index);
			if(container) {
				tab.googleChart = new google.visualization.LineChart(container);
				tab.googleChart.draw(data2, options);
			} else {
				var _this = this;
				setTimeout(function() {
					_this.googleChartDraw(tab);
					console.log('TIMEOUT');
				}, 1000);
			}
		}
	  },

	  convertObjectArrayToArrayArray: function(data) {
		var data2 = [];
		data2.push(Object.keys(data[0]));
		data.forEach(function(row) {
			data2.push(Object.values(row));
		});
		return data2;
	  },

	  asyncInitCalculate: function(_this) {
         setTimeout(function() {
			 _this.calculate();
		 }, 1000);
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
	  _calculate: function(tab) {
		if(tab.index <= 0) return;
		var darlehnsbetrag = tab.input.darlehnsbetrag * 1;
		var sollzins = tab.input.sollzins / 100;
		var anfangstilgung = tab.input.anfangstilgung / 100;
		var zinsbindung = tab.input.zinsbindung * 1;
		var alter = tab.input.alter * 1;
		
		var sollzinsBetrag = darlehnsbetrag * sollzins;
		var anfangstilgungBetrag = darlehnsbetrag * anfangstilgung;
		var rateJahr = sollzinsBetrag + anfangstilgungBetrag;
		var rateMonat = rateJahr / 12;
		var alterZinsBindung = 1*alter+ 1*zinsbindung;

		tab.input.sollzinsBetrag = sollzinsBetrag;
		tab.input.anfangstilgungBetrag = anfangstilgungBetrag;
		tab.input.rateJahr = rateJahr;
		tab.input.rateMonat = rateMonat;
		tab.input.alterZinsBindung = alterZinsBindung;


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

		tab.input.zinsSumme = zinsSumme;
		tab.input.tilgungSumme = tilgungSumme;
		var summeAlles = zinsSumme + tilgungSumme;
		tab.input.summeAlles = summeAlles;
		tab.input.restSchuld = restSchuld;
		
		tab.tabTitle = '' + darlehnsbetrag;
		
		var dataYear = [];
		dataYear[0] = {year: '0', zinsen: 0, tilgung: 0, restSchuld: darlehnsbetrag};
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
        tab.dataYear = dataYear;
		
		this.googleChartDraw(tab);
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
		var that = this;

		var maxYears = 0;
		tabs.forEach(function(tab) {
			if(tab.index > 0) maxYears = Math.max(maxYears, tab.dataYear.length - 1);
		});
		main.dataYear = [];
		for(var year = 0; year <= maxYears; year++) {
			main.dataYear.push({ year: year, zinsen: 0, tilgung: 0, restSchuld: 0 })
		}

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
				that._overviewAddDataFromTab(main.dataYear, tab.dataYear, maxYears);
			}
		});
		this.googleChartDraw(tabs[0]);
	  },

	  _overviewAddDataFromTab: function(target, tabData, maxYears) {
		  var restSchuld = 0;
		  tabData.forEach(function(entry) {
			var year = parseInt(entry.year);
			target[year].zinsen += entry.zinsen;
			target[year].tilgung += entry.tilgung;
			target[year].restSchuld += entry.restSchuld;
			restSchuld = entry.restSchuld;
		  });
		  for(var year = tabData.length; year <= maxYears; year++) {
			target[year].zinsen = 0;
			target[year].tilgung = 0;
			target[year].restSchuld = restSchuld;
		  }
	  }
   });
});