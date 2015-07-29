<?php
/*
 * Permissions model for accessing Brightcove.
 *
 * SA = Super Admin
 * AD = Admin
 * ED = Editor
 * AU = Author
 * CO = Contributor
 *
 * Capability/Role                                  SA AD ED AU CO
 * Set default Brightcove source for own Account     Y  Y  Y  Y  Y
 * View videos                                       Y  Y  Y  Y  Y
 * View playlists                                    Y  Y  Y  Y  Y
 * Insert videos into posts                          Y	Y  Y  Y  Y
 * Upload new videos                                 Y  Y  Y
 * Edit video metadata                               Y  Y  Y
 * Delete videos                                     Y  Y  Y
 * Add/Edit/Delete Brightcove sources                Y  Y
 * Set default Brightcove source for WordPress site  Y  Y
 */
class BC_Permissions {

	public function __construct() {
		global $wp_roles;
		if ( ! isset( $wp_roles->roles[ 'administrator' ][ 'capabilities' ][ 'brightcove_manipulate_accounts' ] ) ){
			$this->add_capabilities();
		}
	}

	protected function add_capabilities() {
		$administrator = get_role( 'administrator' );
		$editor = get_role( 'editor' );

		$administrator->add_cap( 'brightcove_manipulate_accounts' );
		$administrator->add_cap( 'brightcove_set_site_default_account' );
		$administrator->add_cap( 'brightcove_set_user_default_account' );
		$administrator->add_cap( 'brightcove_get_user_default_account' );

		$administrator->add_cap( 'brightcove_manipulate_playlists' );
		$editor->add_cap( 'brightcove_manipulate_playlists' );

		$administrator->add_cap( 'brightcove_manipulate_videos' );
		$editor->add_cap( 'brightcove_manipulate_videos' );
	}

}
