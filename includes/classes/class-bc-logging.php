<?php

class BC_Logging {

	/**
	 * In order to use, `WP_DEBUG` must be enabled. Supports logging to the syslog, a custom file or the API. There is no API reporting at this time (@see `BC_Logging::api_send()`).
	 * In the event a custom file is used, the $file param must be included as a path to the file. If it doesn't exist, is invalid or
	 * is not writable, the method will write to the syslog instead.
	 *
	 * @param        $message. Cannot be binary as `error_log()` is not binary-safe.
	 * @param string $mode syslog|file. Default: syslog
	 * @param bool   $file Full path to custom log file
	 *
	 * @return bool|WP_Error
	 */
	public static function log( $message, $mode = 'syslog', $file = false ) {

		// Sanity. Add a newline to the end as appending a messages to a file does not do it itself.
		$message = $message . "\n";

		if( !defined( 'WP_DEBUG' ) )
			return false;

		if( !ctype_print( $message ) )
			return new WP_Error( 'log-invalid-contents', __( 'Binary content is not supported by the Logging mechanism.', 'brightcove' ) );

		switch( $mode ) {

			case 'file'     :
				if( !$file ) {
					error_log( $message );

					return new WP_Error( 'log-destination-file-not-set', __( 'You must provide a file path and name to use <pre>file</pre> mode. Writing to the syslog instead.', 'brightcove' ) );
				}

				if( !is_file( $file ) ) {
					error_log( $message );

					return new WP_Error( 'log-destination-file-is-invalid', sprintf( __( 'The file specified, <pre>%s</pre> does not exist. Writing to the syslog instead.', 'brightcove' ), $file ) );
				}

				if( !is_writable( $file ) ) {
					error_log( $message );

					return new WP_Error( 'log-destination-file-unwritable', sprintf( __( 'The file specified, <pre>%s</pre> is not writable byt the web server. Writing to the syslog instead.', 'brightcove' ), $file ) );
				}

				error_log( $message, 3, $file );
				break;
			case 'syslog'   :
			default         :
				error_log( $message );
				break;
		}
		return true;
	}
}
