<?php
/**
 * @package Post Status Indicator
 */
/*
Plugin Name: Post Status Indicator
Plugin URI: https://www.seanhayes.biz/plugins/post-status-indicator/
Description: A visual indicator in WordPress admin for the publish state of your content.
Version: 0.1
Author: Sean Hayes
Author URI: https://seanhayes.biz/
License: GPLv2 or later
Text Domain: post-status-indicator
*/

if ( ! defined( 'ABSPATH' ) ) {
	die( 'Invalid request.' );
}

define( 'PSI_VERSION', '0.11' );
define( 'PSI_PLUGIN_PATH', plugin_dir_path( __FILE__ ) );
define( 'PSI_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'PSI_NAMESPACE', 'psi/v1' );
define( 'PSI_OPTIONS', 'psi_options' );

require_once PSI_PLUGIN_PATH . 'psi-settings.php';

add_action( 'admin_enqueue_scripts', 'post_status_indicator' );
add_action( 'admin_enqueue_scripts', 'post_status_dashboard' );
add_action( 'customize_register', 'psi_color_picker' );
add_action( 'rest_api_init', 'psi_rest_api_init' );

function post_status_dashboard() {

	$screen = get_current_screen();

	if ( 'toplevel_page_psi-slug' !== $screen->base && 'settings_page_psi-slug' !== $screen->base ) {
		return;
	}

	$version = PSI_VERSION;

	if( defined('WP_DEBUG') && true === WP_DEBUG ){
		$version = time();
	}

	wp_enqueue_script('psi-dashboard', PSI_PLUGIN_URL . 'psi-dashboard/dist/js/bundle.js', array( 'wp-api', 'wp-i18n', 'wp-components', 'wp-element' ), PSI_VERSION, true);
//	wp_enqueue_style('psi-dashboard', PSI_PLUGIN_URL . 'psi-dashboard/dist/css/style.bundle.css', array(), PSI_VERSION);

	$args = array(
		'post_type'   => 'post',
		'numberposts' => 10,
		'post_status' => 'any', // not inherit, trash, auto-draft or those marked exclude_from_search
	);

	$sample_posts = get_posts( $args );

	$config = array(
		'rest_url'  => rest_url(),
		'namespace' => PSI_NAMESPACE,
		'posts'     => $sample_posts,
		'stati'     => get_post_stati( array(), 'objects' ),
	);
	wp_localize_script('psi-dashboard', 'psi_config', $config);
	wp_enqueue_style( 'post-status-indicator', PSI_PLUGIN_URL . 'css/post-status-indicator.css', array( 'wp-components', 'dashicons' ), PSI_VERSION );

}

function post_status_indicator() {
	if ( defined( 'DOING_AJAX' ) && DOING_AJAX ) {
		return false;
	}

	$screen = get_current_screen();
	if ( 'edit' !== $screen->base ) {
		return;
	}

	wp_register_style( 'post-status-indicator', PSI_PLUGIN_URL . 'css/post-status-indicator.css', array( 'wp-components' ), PSI_VERSION );
	wp_enqueue_style( 'post-status-indicator' );

	$custom_css = '';
	$psi_options = get_option( PSI_OPTIONS );
	$colors = isset($psi_options['colors']) ? $psi_options['colors'] : array();

	if ( !empty( $colors ) ) {
		foreach ( $colors as $post_status => $hex_color ) {
			if ( 'publish' === $post_status )
				continue;
			$custom_css .= '
.wp-admin .wrap .wp-list-table .status-' . sanitize_title_with_dashes( $post_status ) . ' th.check-column{
		background: ' . $hex_color . ';
}';
			if ( true ) { // check setting to see if we need to color these post labels
				$custom_css .=
					'.wp-admin .wrap .subsubsub li.' . sanitize_title_with_dashes( $post_status ) . '{
		background: ' . $hex_color . ';
}
.wp-admin .wrap .subsubsub li.' . sanitize_title_with_dashes( $post_status ) . ' a {
		mix-blend-mode: color-burn;
}';
			}
		}
		wp_add_inline_style( 'post-status-indicator', $custom_css );
	}

}

function psi_color_picker( $wp_customize ){

	$wp_customize->add_section( 'psi_color_section', array(
		'title'       => 'Post Status Indicator',
		'description' => 'Set colors for each Post Status',
		'priority'    => '140'
	));

	// Loop through Post statuses
	foreach ( get_post_stati() as $post_status ) {
		if ( 'publish' === $post_status )
			continue;

		// Add Settings
		$wp_customize->add_setting( 'psi_status_' . $post_status, array(
			'default' => '#04bfbf',
		));

		// Add Controls
		$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'psi_status_' . $post_status, array(
			'label'    => ucfirst( $post_status ),
			'section'  => 'psi_color_section',
			'settings' => 'psi_status_' . $post_status
		)));

	}
}

function psi_rest_api_init() {
	register_rest_route( 'psi/v1', '/optionsettings', array(
		'methods' => WP_REST_Server::READABLE,
		'callback' => 'get_psi_options',
		'permission_callback' => '__return_true',
	));

	register_rest_route( 'psi/v1', '/optionsettings', array(
		'methods' => WP_REST_Server::CREATABLE,
		'callback' => 'save_psi_options',
		'permission_callback' => '__return_true',
	));
}

function get_psi_options() {
	return get_option( PSI_OPTIONS, array() );
}

function save_psi_options( $request ){
	if( $request->get_params() ){
		$theme_options = $request->get_params();
		update_option('psi_options', $theme_options);
	}
}
