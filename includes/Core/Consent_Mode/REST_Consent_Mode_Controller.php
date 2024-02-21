<?php
/**
 * Class Google\Site_Kit\Core\Consent_Mode\REST_Consent_Mode_Controller
 *
 * @package   Google\Site_Kit\Core\Consent_Mode
 * @copyright 2024 Google LLC
 * @license   https://www.apache.org/licenses/LICENSE-2.0 Apache License 2.0
 * @link      https://sitekit.withgoogle.com
 */

namespace Google\Site_Kit\Core\Consent_Mode;

use Google\Site_Kit\Core\Permissions\Permissions;
use Google\Site_Kit\Core\REST_API\REST_Route;
use Google\Site_Kit\Core\REST_API\REST_Routes;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

/**
 * Class for handling Consent Mode.
 *
 * @since n.e.x.t
 * @access private
 * @ignore
 */
class REST_Consent_Mode_Controller {

	/**
	 * Consent_Mode_Settings instance.
	 *
	 * @since n.e.x.t
	 * @var Consent_Mode_Settings
	 */
	private $consent_mode_settings;

		/**
		 * Constructor.
		 *
		 * @since n.e.x.t
		 *
		 * @param Consent_Mode_Settings $consent_mode_settings Consent_Mode_Settings instance.
		 */
	public function __construct( Consent_Mode_Settings $consent_mode_settings ) {
		$this->consent_mode_settings = $consent_mode_settings;
	}

	/**
	 * Registers functionality through WordPress hooks.
	 *
	 * @since n.e.x.t
	 */
	public function register() {
		add_filter(
			'googlesitekit_rest_routes',
			function ( $routes ) {
				return array_merge( $routes, $this->get_rest_routes() );
			}
		);

		add_filter(
			'googlesitekit_apifetch_preload_paths',
			function ( $paths ) {
				return array_merge(
					$paths,
					array(
						'/' . REST_Routes::REST_ROOT . '/core/site/data/consent-mode',
					)
				);
			}
		);
	}

	/**
	 * Gets REST route instances.
	 *
	 * @since n.e.x.t
	 *
	 * @return REST_Route[] List of REST_Route objects.
	 */
	protected function get_rest_routes() {
		$can_manage_options = function () {
			return current_user_can( Permissions::MANAGE_OPTIONS );
		};

		return array(
			new REST_Route(
				'core/site/data/consent-mode',
				array(
					array(
						'methods'             => WP_REST_Server::READABLE,
						'callback'            => function () {
							return new WP_REST_Response( $this->consent_mode_settings->get() );
						},
						'permission_callback' => $can_manage_options,
					),
					array(
						'methods'             => WP_REST_Server::EDITABLE,
						'callback'            => function ( WP_REST_Request $request ) {
							$this->consent_mode_settings->set(
								$request['data']['settings']
							);

							return new WP_REST_Response( $this->consent_mode_settings->get() );
						},
						'permission_callback' => $can_manage_options,
						'args'                => array(
							'data' => array(
								'type'       => 'object',
								'required'   => true,
								'properties' => array(
									'settings' => array(
										'type'          => 'object',
										'required'      => true,
										'minProperties' => 1,
										'additionalProperties' => false,
										'properties'    => array(
											'enabled' => array(
												'type' => 'boolean',
											),
											'regions' => array(
												'type'  => 'array',
												'items' => array(
													'type' => 'string',
												),
											),
										),
									),
								),
							),
						),
					),
				)
			),
		);
	}
}
