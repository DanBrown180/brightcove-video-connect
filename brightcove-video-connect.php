<?php
/**
 * Plugin Name: Brightcove Video Connect
 * Plugin URI:  https://wordpress.org/plugins/brightcove-video-connect/
 * Description: A Brightcove™ Connector for WordPress that leverages enhanced APIs and Brightcove™ Capabilities
 * Version:     1.0.4
 * Author:      10up
 * Author URI:  http://10up.com
 * License:     GPLv2+
 * Text Domain: brightcove
 * Domain Path: /languages
 */

/**
 * Copyright (c) 2015 10up
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License, version 2 or, at
 * your discretion, any later version, as published by the Free
 * Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  021.0.2301  USA
 */

define( 'BRIGHTCOVE_VERSION', '1.0.4' );
define( 'BRIGHTCOVE_URL', plugin_dir_url( __FILE__ ) );
define( 'BRIGHTCOVE_PATH', dirname( __FILE__ ) . '/' );
define( 'BRIGHTCOVE_BASENAME', plugin_basename( __FILE__ ) );

/**
 * Activate the plugin
 */
function brightcove_activate() {

	update_option( '_brightcove_plugin_activated', true, 'no' );
	flush_rewrite_rules();
}

register_activation_hook( __FILE__, 'brightcove_activate' );

/**
 * Deactivate the plugin
 * Uninstall routines should be in uninstall.php
 */
function brightcove_deactivate() {

    require_once( BRIGHTCOVE_PATH . 'includes/classes/class-bc-accounts.php' );

	$bc_accounts = new BC_Accounts();

	$accounts = $bc_accounts->get_sanitized_all_accounts();

	foreach ( $accounts as $account => $account_data ) {

		$bc_accounts->set_current_account( $account );

		$account_hash = $bc_accounts->get_account_hash();

		delete_transient( 'brightcove_oauth_access_token_' . $account_hash );

		$bc_accounts->restore_default_account();

	}

	delete_transient( 'brightcove_sync_playlists' );
	delete_transient( 'brightcove_sync_videos' );
	delete_option( '_brightcove_plugin_activated' );

}

register_deactivation_hook( __FILE__, 'brightcove_deactivate' );

// Wireup actions
global $pagenow;
if (in_array($pagenow, array('admin-ajax.php', 'admin.php', 'post-new.php', 'edit.php', 'post.php'))) {
    add_action( 'init', array( 'BC_Setup', 'action_init' ) );
    add_action( 'init', array( 'BC_Setup', 'bc_check_minimum_wp_version' ) );
} else {
    require_once( BRIGHTCOVE_PATH . 'includes/classes/class-bc-playlist-shortcode.php' );
    require_once( BRIGHTCOVE_PATH . 'includes/classes/class-bc-video-shortcode.php' );
    require_once( BRIGHTCOVE_PATH . 'includes/classes/class-bc-utility.php' );
    require_once( BRIGHTCOVE_PATH . 'includes/classes/admin/class-bc-admin-menu.php' );
    require_once( BRIGHTCOVE_PATH . 'includes/classes/class-bc-accounts.php' );
    require_once( BRIGHTCOVE_PATH . 'includes/classes/class-bc-accounts.php' );
    global $bc_accounts;
    $bc_accounts = new BC_Accounts();
    new BC_Admin_Menu();
    add_action( 'admin_notices', array( 'BC_Setup', 'bc_activation_admin_notices' ) );
}
add_action( 'init', array( 'BC_Video_Shortcode', 'shortcode' ) );
add_action( 'init', array( 'BC_Playlist_Shortcode', 'shortcode' ) );

// Add settings to plugin action links
add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), array( 'BC_Utility', 'bc_plugin_action_links' ) );

// Add WP-CLI Support (should be before init)
require_once( BRIGHTCOVE_PATH . 'includes/classes/class-bc-setup.php' );
