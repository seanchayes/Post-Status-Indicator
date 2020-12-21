<?php
/**
 * Add the top level menu page.
 */
function psi_options_page() {
	$options = get_option( PSI_OPTIONS, array() );

	if ( empty( $options ) ) {
		$options = array();
		$options['psi_menu_location'] = 'own_menu';
	}

	if ( $options ) {
		if ( 'own_menu' === $options['psi_menu_location'] ) {
			add_menu_page(
				'Post Status Indicator',
				'Post Status Indicator',
				'manage_options',
				'psi-slug',
				'psi_options_page_html'
			);
		} else {
			add_submenu_page(
				'options-general.php',
				'Post Status Indicator',
				'Post Status Indicator',
				'manage_options',
				'psi-slug',
				'psi_options_page_html'
			);
		}
	}

}

/**
 * Register our wporg_options_page to the admin_menu action hook.
 */
add_action( 'admin_menu', 'psi_options_page' );

/**
 * Top level menu callback function
 */
function psi_options_page_html() {
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
