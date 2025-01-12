<?php
/**
 * Conversion_Reporting_Events_SyncTest
 *
 * @package   Google\Site_Kit\Tests\Modules\Analytics_4\Conversion_Reporting
 * @copyright 2024 Google LLC
 * @license   https://www.apache.org/licenses/LICENSE-2.0 Apache License 2.0
 * @link      https://sitekit.withgoogle.com
 */

namespace Google\Site_Kit\Tests\Modules\Analytics_4\Conversion_Reporting;

use Google\Site_Kit\Context;
use Google\Site_Kit\Core\Authentication\Authentication;
use Google\Site_Kit\Core\Storage\Options;
use Google\Site_Kit\Core\Storage\User_Options;
use Google\Site_Kit\Modules\Analytics_4;
use Google\Site_Kit\Modules\Analytics_4\Conversion_Reporting\Conversion_Reporting_Events_Sync;
use Google\Site_Kit\Modules\Analytics_4\Settings;
use Google\Site_Kit\Tests\Fake_Site_Connection_Trait;
use Google\Site_Kit\Tests\FakeHttp;
use Google\Site_Kit\Tests\TestCase;
use Google\Site_Kit_Dependencies\GuzzleHttp\Psr7\Request;
use Google\Site_Kit_Dependencies\GuzzleHttp\Psr7\Response;

/**
 * @group Conversion_Reporting
 */
class Conversion_Reporting_Events_SyncTest extends TestCase {
	use Fake_Site_Connection_Trait;

	private $user;
	private $settings;
	private $analytics;
	private $authentication;
	private $request_handler_calls;

	public function set_up() {
		parent::set_up();

		$this->request_handler_calls = array();

		$this->user   = $this->factory()->user->create_and_get( array( 'role' => 'administrator' ) );
		$context      = new Context( __FILE__ );
		$options      = new Options( $context );
		$user_options = new User_Options( $context, $this->user->ID );

		$this->settings = new Settings( $options );
		$this->settings->register();

		$this->authentication = new Authentication( $context, $options, $user_options );

		$this->analytics = new Analytics_4( $context, $options, $user_options, $this->authentication );

		wp_set_current_user( $this->user->ID );
	}

	/**
	 * @dataProvider report_dimensions
	 */
	public function test_check_for_events( $detected_events, $report_rows ) {
		$this->setup_fake_handler_and_analytics( $report_rows );

		$event_check = $this->get_instance();
		$event_check->check_for_events();

		$this->assertEquals( $detected_events, $this->settings->get()['detectedEvents'] );
	}

	public function get_instance() {
		return new Conversion_Reporting_Events_Sync(
			$this->settings,
			$this->analytics
		);
	}

	public function setup_fake_handler_and_analytics( $report_rows ) {
		$property_id = '123456789';

		$this->analytics->get_settings()->merge(
			array(
				'ownerID'    => $this->user->ID,
				'propertyID' => $property_id,
			)
		);

		// Grant scopes so request doesn't fail.
		$this->authentication->get_oauth_client()->set_granted_scopes(
			$this->analytics->get_scopes()
		);

		FakeHttp::fake_google_http_handler(
			$this->analytics->get_client(),
			$this->create_fake_http_handler( $property_id, $report_rows )
		);

		$this->analytics->register();
	}

	/**
	 * Creates a fake HTTP handler with call tracking.
	 *
	 * @param string $property_id The GA4 property ID to use.
	 */
	protected function create_fake_http_handler( $property_id, $report_rows ) {
		$this->request_handler_calls = array();

		return function ( Request $request ) use ( $property_id, $report_rows ) {
			$url    = parse_url( $request->getUri() );
			$params = json_decode( (string) $request->getBody(), true );

			$this->request_handler_calls[] = array(
				'url'    => $url,
				'params' => $params,
			);

			switch ( $url['path'] ) {
				case "/v1beta/properties/$property_id:runReport":
					// Return a mock report.
					return new Response(
						200,
						array(),
						json_encode(
							array(
								'kind'     => 'analyticsData#runReport',
								'rowCount' => 1,
								'rows'     => $report_rows,
							)
						)
					);

				default:
					return new Response( 200 );
			}
		};
	}

	public function report_dimensions() {
		return array(
			array(
				array( 'generate_lead' ),
				array(
					array(
						'dimensionValues' => array(
							array(
								'value' => 'generate_lead',
							),
						),
					),
				),
			),
			array(
				array( 'generate_lead', 'submit_lead_form' ),
				array(
					array(
						'dimensionValues' => array(
							array(
								'value' => 'generate_lead',
							),
						),
					),
					array(
						'dimensionValues' => array(
							array(
								'value' => 'submit_lead_form',
							),
						),
					),
				),
			),
			array(
				array(),
				array(),
			),
		);
	}
}
