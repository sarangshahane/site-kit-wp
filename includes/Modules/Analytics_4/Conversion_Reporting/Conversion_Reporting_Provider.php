<?php
/**
 * Class Google\Site_Kit\Modules\Analytics_4\Conversion_Reporting\Conversion_Reporting_Provider
 *
 * @package   Google\Site_Kit
 * @copyright 2024 Google LLC
 * @license   https://www.apache.org/licenses/LICENSE-2.0 Apache License 2.0
 * @link      https://sitekit.withgoogle.com
 */

namespace Google\Site_Kit\Modules\Analytics_4\Conversion_Reporting;

use Google\Site_Kit\Core\Storage\User_Options;
use Google\Site_Kit\Modules\Analytics_4;
use Google\Site_Kit\Modules\Analytics_4\Settings;

/**
 * Class providing the integration of conversion reporting.
 *
 * @since n.e.x.t
 * @access private
 * @ignore
 */
class Conversion_Reporting_Provider {

	/**
	 * User_Options instance.
	 *
	 * @var User_Options
	 */
	private $user_options;

	/**
	 * Analytics_4 instance.
	 *
	 * @var Analytics_4
	 */
	private $analytics;

	/**
	 * Conversion_Reporting_Cron instance.
	 *
	 * @var Conversion_Reporting_Cron
	 */
	private Conversion_Reporting_Cron $cron;

	/**
	 * Conversion_Reporting_Events_Check instance.
	 *
	 * @var Conversion_Reporting_Events_Check
	 */
	private Conversion_Reporting_Events_Sync $events_check;

	/**
	 * Constructor.
	 *
	 * @since n.e.x.t
	 *
	 * @param Settings     $settings     Settings instance.
	 * @param User_Options $user_options User_Options instance.
	 * @param Analytics_4  $analytics    analytics_4 instance.
	 */
	public function __construct(
		Settings $settings,
		User_Options $user_options,
		Analytics_4 $analytics
	) {
		$this->user_options = $user_options;
		$this->analytics    = $analytics;

		$this->events_check = new Conversion_Reporting_Events_Sync( $settings, $this->analytics );
		$this->cron         = new Conversion_Reporting_Cron( fn() => $this->cron_callback() );
	}

	/**
	 * Registers functionality through WordPress hooks.
	 *
	 * @since n.e.x.t
	 */
	public function register() {
		$this->cron->register();

		add_action( 'load-toplevel_page_googlesitekit-dashboard', fn () => $this->on_dashboard_load() );
	}

	/**
	 * Handles the googlesitekit-dashboard page load callback.
	 *
	 * @since n.e.x.t
	 */
	protected function on_dashboard_load() {
		$this->cron->maybe_schedule_cron();
	}

	/**
	 * Handles the cron callback.
	 *
	 * @since n.e.x.t
	 */
	protected function cron_callback() {
		$owner_id     = $this->analytics->get_owner_id();
		$restore_user = $this->user_options->switch_user( $owner_id );

		$this->events_check->check_for_events();

		$restore_user();
	}
}
