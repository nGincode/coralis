<?php

namespace Config;

// Create a new instance of our RouteCollection class.
$routes = Services::routes();

/*
 * --------------------------------------------------------------------
 * Router Setup
 * --------------------------------------------------------------------
 */
$routes->setDefaultNamespace('App\Controllers');
$routes->setDefaultController('Home');
$routes->setDefaultMethod('index');
$routes->setTranslateURIDashes(false);
$routes->set404Override();
// The Auto Routing (Legacy) is very dangerous. It is easy to create vulnerable apps
// where controller filters or CSRF protection are bypassed.
// If you don't want to define all routes, please use the Auto Routing (Improved).
// Set `$autoRoutesImproved` to true in `app/Config/Feature.php` and set the following to true.
// $routes->setAutoRoute(false);

/*
 * --------------------------------------------------------------------
 * Route Definitions
 * --------------------------------------------------------------------
 */

// We get a performance increase by specifying the default
// route since we don't have to scan directories.

//home controler
$routes->get('/', 'Home::index');

$routes->post('/api/login', 'Auth::login');
$routes->post('/api/register', 'Auth::register');
$routes->get('/api/token', 'Auth::cekToken');
$routes->post('/api/emailSend', 'Auth::emailSend');
$routes->get('/api/emailActivation', 'Auth::emailActivation');
$routes->post('/api/forgotPass', 'Auth::forgotPass');
$routes->post('/api/resetPass', 'Auth::resetPass');

$routes->group('api', ['filter' => 'auth'], static function ($routes) {
    $routes->get('users/(:any)', 'Users::get/$1');
    $routes->post('users/setting/(:any)', 'Users::setting/$1');
    // $routes->resource('users');
});

/*
 * --------------------------------------------------------------------
 * Additional Routing
 * --------------------------------------------------------------------
 *
 * There will often be times that you need additional routing and you
 * need it to be able to override any defaults in this file. Environment
 * based routes is one such time. require() additional route files here
 * to make that happen.
 *
 * You will have access to the $routes object within that file without
 * needing to reload it.
 */
if (is_file(APPPATH . 'Config/' . ENVIRONMENT . '/Routes.php')) {
    require APPPATH . 'Config/' . ENVIRONMENT . '/Routes.php';
}
