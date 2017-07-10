/**
 * Created by kvark on 10/07/17.
 */

var Widget = {

    url : 'http://localhost:3000',

    create : function( city, days, position, username )
    {
        $.ajax({
            url: this.url + '/create',
            data: {
                city: city,
                days: days,
                pos: position,
                username: username
            },
            method: "get",
            context: document.body
        }).done(function( response ) {

            if( response === 'OK' )
            {
                setTimeout( function() {
                    window.location.reload();
                }, 500);
            }

        });
    },

    list : function( callback )
    {
        $.ajax({
            url: this.url + '/list',
            context: document.body
        }).done(function( response ) {

            console.log( response );

            callback( response );

        });
    },

    update : function( city, days, position, username, id )
    {
        $.ajax({
            url: this.url + '/update',
            data: {
                city: city,
                days: days,
                pos : position,
                user: username,
                id  : id
            },
            method: "get",
            context: document.body
        }).done(function( response ) {

            if( response === 'OK' )
            {
                setTimeout( function() {
                    window.location.reload();
                }, 500);
            }

        });
    },

    listUsers: function( callback )
    {
        $.ajax({
            url: this.url + '/users',
            method: "get",
            context: document.body
        }).done(function( response ) {

            if( response )
                callback( response );


        });
    }

};