# intersol_weather_widget
Weather widget for company intersol

Для корректной работы необходимо настроить:

widget_backends.js

14:var port = 3000;

15:var hostUrl = 'http://localhost/intersol';

16:var nodeUrl = 'http://localhost:' + port;


20:var connection = mysql.createConnection({

21:    host     : 'localhost',

22:    user     : 'admin',

23:    password : 'admin',

24:    database : 'weather'

25:});

___________
index.html

12: <link rel="stylesheet" href="style.css">

13: <script type="text/javascript" src="core.js"></script>


___________
panel.html

16: <link rel="stylesheet" href="http://localhost/intersol/style.css">

17: <script type="text/javascript" src="http://localhost/intersol/core.js"></script>

core.js
7:url : 'http://localhost:3000',

Файл с миграциями:
weather.sql
