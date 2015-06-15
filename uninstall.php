<?php

/**
 * Uninstall Brightcove
 *
 * Removes all Brightcove data stored by the plugin
 *
 * @since   1.0.0
 *
 * @package Brightcove_Video_Connect
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) || ! WP_UNINSTALL_PLUGIN ) {
	exit();
}

global $wpdb;

//Delete static options
delete_option( '_brightcove_pending_videos' );
delete_option( '_brightcove_salt' );
delete_option( '_brightcove_accounts' );
delete_option( '_brightcove_default_account' );

//Delete synced video data
$wpdb->query( "DELETE FROM $wpdb->postmeta WHERE meta_key LIKE '_brightcove%';" );
$wpdb->query( "DELETE FROM $wpdb->posts WHERE post_type = 'brightcove-playlist';" );
$wpdb->query( "DELETE FROM $wpdb->posts WHERE post_type = 'brightcove-video';" );

//Delete variable options
$wpdb->query( "DELETE FROM $wpdb->options WHERE option_name LIKE '_brightcove%';" );
$wpdb->query( "DELETE FROM $wpdb->options WHERE option_name LIKE '_bc_player%';" );
$wpdb->query( "DELETE FROM $wpdb->options WHERE option_name LIKE '_notifications_subscribed_%';" );
