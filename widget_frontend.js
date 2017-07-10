/**
 * Created by kvark on 10/07/17.
 */


module.exports = {

    moscowLatLng : '55.751244, 37.618423',
    piterLatLng  : '59.9342802, 30.3350986',
    niznijLatLng : '56.2965039, 43.9360589',

    getRandomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    },

    generateHTML: function ( days, city, position ) {

        var width = 'width:' + (days * 100) + 'px;' ;
        var display = 'display:flex;';
        var gradient = 'right';
        var latlng = '';

        var d = new Date();
        var month = d.getMonth() + 1;
        var year = d.getFullYear();

        if(month < 10)
            month = '0' + month;

        if(position === 'Vertical')
        {
            width = 'width:100px;';
            display = 'display:block;';
            gradient = 'bottom';
        }

        // if( city === 'Москва' )
        //     latlng = this.moscowLatLng;
        // else if( city === 'Санкт-петербург' )
        //     latlng = this.piterLatLng;
        // else
        //     latlng = this.niznijLatLng;

        var liTag = '';
        var from = this.getRandomInt(15, 35);
        var to = from + this.getRandomInt( 1, 5 );

        for(var i=0;i<days;i++)
        {
            liTag += '' +
                '<li style="flex-grow: 2;border: 1px solid #FFF;">' +
                    '<div>24 Mon</div>' +
                    '<div>' + from + '-' + to +' &#8451;</div>' +
                '</li>';

        }

        var html = '<div style="' + width + 'background: #36d1dc;background: -webkit-linear-gradient(' + gradient + ', #36d1dc, #5b86e5);background: linear-gradient(to ' + gradient + ', #36d1dc, #5b86e5);text-align: center;color: #FFF;border-radius: 4px;">' +
            '<h4>' + city + '</h4>' +
            '<p>' + month + ' ' + year + '</p>' +
            '<ul style="' + display + 'list-style: none;padding: 0px;background: -webkit-linear-gradient(' + gradient + ', #000000, #e5008d, #ff070b);-webkit-background-clip: text;-webkit-text-fill-color: transparent;">' +
                liTag +
            '</ul>' +
            '</div>';

        return html;
    },
};