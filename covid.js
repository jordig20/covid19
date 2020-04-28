// URLS
const urlCors = 'https://cors-anywhere.herokuapp.com/';
const urlPaisos = 'http://covid.codifi.cat/countries.php?country=';
const urlDadesCovid = urlCors + 'https://opendata.ecdc.europa.eu/covid19/casedistribution/json/';
const urlRecuperats = urlCors + 'https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/Coronavirus_2019_nCoV_Cases/FeatureServer/2/query?where=1%3D1&outFields=Country_Region,Last_Update,Deaths,Recovered,Confirmed&outSR=4326&f=json';

// Variables on desem les dades
let dadesCovid;
let dadesRecuperats;

window.onload = function () {
    // Fem les dues peticions de la data, i quan acabi amaguem spinner
    $.when(
        $.ajax({
            url: urlDadesCovid,
            type: 'get',
            dataType: 'json',
            success: function (response) {
                dadesCovid = response;
            },
        }),
        $.ajax({
            url: urlRecuperats,
            type: 'get',
            dataType: 'json',
            success: function (response) {
                dadesRecuperats = response;
                dadesRecuperats = dadesRecuperats.features;
            },
        }),
    ).then(function () {
        $('.loading').hide();
    });


    // Al polsar una tecla al camp de cercar executa una funció
    $('#key').on('input', function () {
        //Maneguem l'entrada
        let entrada = this.value;
        if (entrada !== '') {
            $('#suggestions').empty();
            // Fem la peti a l'api amb l'entrada de l'input
            $.ajax({
                url: urlPaisos + entrada,
                type: 'get',
                dataType: 'json',
                success: function (response) {
                    //recorrem la resposta i la printem
                    for (let key in response) {
                        $('#suggestions').append(
                            `<div id="${key}" class="country suggestions"> ${response[key]}</div>`,
                        ).show();
                    }
                    // Quan clickem en un pais guardem la id i el nom del pais i omplim les dades necessaries
                    $('.country').click(function () {
                        let id = this.id;
                        let countryText = this.innerHTML;
                        $('#suggestions').empty().hide();
                        $('#country_name').html(countryText);
                        $('#key').val('');
                        $('#old_days, #current_date, #current_infected, #current_deaths, #current_recovered').empty();
                        for (let i = 0; i < dadesCovid["records"].length; i++) {
                            if (dadesCovid['records'][i].geoId === id) {
                                let data = `
                                    <div class="col-xl-2 col-lg-4 col-md-6">
                                        <div class="card mb-3">
                                            <div class="row no-gutters h-100">
                                                <div class="col-12">
                                                    <div class="card-body">
                                                        <div><i class="fas fa-calendar-alt text-primary"></i> ${dadesCovid['records'][i].dateRep}</div>
                                                        <div><i class="fas fa-bug text-warning"></i> ${dadesCovid['records'][i].cases}</div>
                                                        <div><i class="fas fa-skull-crossbones text-danger"></i> ${dadesCovid['records'][i].deaths}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>`;
                                $('#old_days').append(data);
                            }
                        }
                        for (let i = 0; i < dadesRecuperats.length; i++) {
                            if (dadesRecuperats[i].attributes['Country_Region'] === countryText.trim()) {
                                let data = new Date(dadesRecuperats[i].attributes.Last_Update).toLocaleDateString();
                                $('#current_date').html(data);
                                $('#current_infected').html(dadesRecuperats[i].attributes.Confirmed);
                                $('#current_deaths').html(dadesRecuperats[i].attributes.Deaths);
                                $('#current_recovered').html(dadesRecuperats[i].attributes.Recovered);
                            }
                        }
                    });
                },
            });
        } else {
            $('#suggestions').empty().hide();
        }
    });
};
