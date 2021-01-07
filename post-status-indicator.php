<?php
/**
 *
 * @package   PostStatusIndicator
 * @author    Sean Hayes <sean@seanhayes.biz>
 * @license   GPL-2.0+
 * @link      https://www.seanhayes.biz
 * @copyright 2020 Sean Hayes
 *
 * @wordpress-plugin
 * Plugin Name:       Post Status Indicator
 * Plugin URI:        https://www.seanhayes.biz/post-status-indicator-wordpress-plugin/
 * Description:       Adds and allows customization of a visual indicator in WordPress admin for the publish state of your content.
 * Version:           1.0.1
 * Author:            Sean Hayes
 * Author URI:        https://www.seanhayes.biz
 * Text Domain:       post-status-indicator
 * License:           GPLv2 or later
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Domain Path:       /languages
 */

if ( ! defined( 'ABSPATH' ) ) {
	die( 'Invalid request.' );
}

register_uninstall_hook(__FILE__, 'psi_remove_psi_options');

if( !defined( 'PSI_VERSION' ) ) {
	define( 'PSI_VERSION', '1.0.1' );
}

if( !defined( 'PSI_PLUGIN_PATH' ) ){
	define( 'PSI_PLUGIN_PATH', plugin_dir_path( __FILE__ ) );
}

if( !defined( 'PSI_PLUGIN_URL' ) ) {
	define( 'PSI_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
}
if( !defined( 'PSI_NAMESPACE' ) ) {
	define( 'PSI_NAMESPACE', 'psi/v1' );
}

if( !defined( 'PSI_OPTIONS' ) ) {
	define( 'PSI_OPTIONS', 'psi_options' );
}

if ( !class_exists( 'WP_Post_Status_Indicator' ) ) {

	class WP_Post_Status_Indicator {

		static $instance = false;
		private $version;

		private function __construct() {

			add_action( 'admin_enqueue_scripts', array( $this, 'post_status_indicator' ) );
			add_action( 'admin_enqueue_scripts', array( $this, 'post_status_dashboard' ) );
			add_action( 'admin_menu', array( $this, 'psi_options_page' ) );
			add_action( 'rest_api_init', array( $this, 'rest_api_init' ) );

			$this->version = PSI_VERSION;

			if( defined('WP_DEBUG') && true === WP_DEBUG ){
				$this->version = time();
			}
		}

		public static function getInstance() {
			if ( ! self::$instance ) {
				self::$instance = new WP_Post_Status_Indicator;
			}
			return self::$instance;
		}

		public function post_status_dashboard() {

			$screen = get_current_screen();

			if (
					'toplevel_page_psi-slug' !== $screen->base &&
					'settings_page_psi-slug' !== $screen->base &&
					'tools_page_psi-slug' !== $screen->base
			) {
				return;
			}

			wp_enqueue_script('psi-dashboard', PSI_PLUGIN_URL . 'psi-dashboard/dist/js/post-status-indicator.js', array( 'wp-api', 'wp-i18n', 'wp-components', 'wp-element' ), $this->version, true);
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
				'nonce' 	=> wp_create_nonce('wp_rest')
			);
			wp_localize_script('psi-dashboard', 'psi_config', $config);
			wp_enqueue_style( 'post-status-indicator', PSI_PLUGIN_URL . 'css/post-status-indicator.css', array( 'wp-components', 'dashicons' ), $this->version );

		}

		public function post_status_indicator() {
			if ( defined( 'DOING_AJAX' ) && DOING_AJAX ) {
				return false;
			}

			$screen = get_current_screen();
			if ( 'edit' !== $screen->base ) {
				return;
			}

			wp_register_style( 'post-status-indicator', PSI_PLUGIN_URL . 'css/post-status-indicator.css', array( 'wp-components' ), $this->version );
			wp_enqueue_style( 'post-status-indicator' );

			$custom_css = '';
			$psi_options = get_option( PSI_OPTIONS );
			$colors = isset($psi_options['colors']) ? $psi_options['colors'] : array();

			if ( !empty( $colors ) ) {
				foreach ( $colors as $color ) {
					$custom_css .= '
	.wp-admin .wrap .wp-list-table .status-' . sanitize_title_with_dashes( $color['name'] ) . ' th.check-column{
		background: ' . $color['value'] . ';
	}';
					if ( true === $psi_options['color_post_labels'] ) { // check setting to see if we need to color these post labels
						$custom_css .=
							'.wp-admin .wrap .subsubsub li.' . sanitize_title_with_dashes( $color['name'] ) . ' a {
		background: ' . $color['value'] . ';
		padding: 5px;
		border-radius: 2px;
	}';
					}
				}
				wp_add_inline_style( 'post-status-indicator', $custom_css );
			}

		}

		public function rest_api_init() {
			register_rest_route( 'psi/v1', '/settings', array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array( $this, 'get_psi_options' ),
				'permission_callback' => function () {
					return current_user_can( 'edit_others_posts' );
				}
			));

			register_rest_route( 'psi/v1', '/settings', array(
				'methods' => WP_REST_Server::CREATABLE,
				'callback' => array( $this, 'save_psi_options' ),
				'permission_callback' => function () {
					return current_user_can( 'edit_others_posts' );
				}
			));
		}

		public function get_psi_options() {
			return get_option( PSI_OPTIONS, array() );
		}

		public function save_psi_options( $request ){
			if( $request->get_params() ){
				$theme_options = $request->get_params();
				return new WP_REST_Response(
					update_option(PSI_OPTIONS, $theme_options)
				);
			}
			return new WP_Error( 418 );
		}

		/**
		 * Upon uninstall delete plugin settings from the options table.
		 */
		public function remove_psi_options() {
			delete_option( PSI_OPTIONS );
		}
		/**
		 * Add the top level menu page.
		 */
		public function psi_options_page() {
			$options = get_option( PSI_OPTIONS, array() );

			if ( empty( $options ) ) {
				$options = array();
				$options['psi_menu_location'] = 'own_menu';
			}

			if ( $options ) {
				switch ( $options['psi_menu_location'] ) {
					case 'settings_menu':
						add_submenu_page(
								'options-general.php',
								'Post Status Indicator',
								'Post Status Indicator',
								'manage_options',
								'psi-slug',
								array( $this, 'psi_options_page_html' )
						);
						break;
					case 'tools_menu':
						add_submenu_page(
								'tools.php',
								'Post Status Indicator',
								'Post Status Indicator',
								'manage_options',
								'psi-slug',
								array( $this, 'psi_options_page_html' )
						);
						break;
					default:
					case 'own_menu':
						add_menu_page(
								'Post Status Indicator',
								'Post Status Indicator',
								'manage_options',
								'psi-slug',
								array( $this, 'psi_options_page_html' )
						);
						break;
				}
			}

		}
		/**
		 * Top level menu callback function
		 */
		public function psi_options_page_html() {
			// check user capabilities
			if ( ! current_user_can( 'manage_options' ) ) {
				return;
			}
			?>
			<div class="wrap">
				<div id="psi-dashboard"></div>
			</div>
			<?php
		}

	}

	$WP_Post_Status_Indicator = WP_Post_Status_Indicator::getInstance();

}
