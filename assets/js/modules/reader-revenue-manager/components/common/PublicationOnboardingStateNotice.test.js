/**
 * Reader Revenue Manager PublicationOnboardingStateNotice component tests.
 *
 * Site Kit by Google, Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Internal dependencies.
 */
import {
	act,
	createTestRegistry,
	fireEvent,
	provideUserAuthentication,
	provideUserInfo,
	render,
} from '../../../../../../tests/js/test-utils';
import { VIEW_CONTEXT_MAIN_DASHBOARD } from '../../../../googlesitekit/constants';
import * as tracking from '../../../../util/tracking';
import {
	MODULES_READER_REVENUE_MANAGER,
	PUBLICATION_ONBOARDING_STATES,
} from '../../datastore/constants';
import PublicationOnboardingStateNotice from './PublicationOnboardingStateNotice';

const mockTrackEvent = jest.spyOn( tracking, 'trackEvent' );
mockTrackEvent.mockImplementation( () => Promise.resolve() );

describe( 'PublicationOnboardingStateNotice', () => {
	let registry;

	const {
		ONBOARDING_ACTION_REQUIRED,
		ONBOARDING_COMPLETE,
		PENDING_VERIFICATION,
	} = PUBLICATION_ONBOARDING_STATES;

	beforeEach( () => {
		mockTrackEvent.mockClear();
		registry = createTestRegistry();
		provideUserAuthentication( registry );
		provideUserInfo( registry );
	} );

	it( 'should not render the component when state is not PENDING_VERIFICATION or ONBOARDING_ACTION_REQUIRED', () => {
		registry
			.dispatch( MODULES_READER_REVENUE_MANAGER )
			.receiveGetSettings( {
				publicationID: 'ABCDEFGH',
				publicationOnboardingState: ONBOARDING_COMPLETE,
				publicationOnboardingStateLastSyncedAtMs: 0,
			} );

		const { container } = render( <PublicationOnboardingStateNotice />, {
			registry,
		} );

		expect( container ).toBeEmptyDOMElement();
		expect( mockTrackEvent ).not.toHaveBeenCalled();
	} );

	it.each( [
		[
			ONBOARDING_ACTION_REQUIRED,
			'Your publication requires further setup in Reader Revenue Manager',
			'Complete publication setup',
		],
		[
			PENDING_VERIFICATION,
			'Your publication is still awaiting review. You can check its status in Reader Revenue Manager.',
			'Check publication status',
		],
	] )(
		'should render the appropriate notice when the onboarding state is %s',
		async ( publicationState, expectedText, ctaText ) => {
			registry
				.dispatch( MODULES_READER_REVENUE_MANAGER )
				.receiveGetSettings( {
					publicationID: 'ABCDEFGH',
					publicationOnboardingState: publicationState,
					publicationOnboardingStateLastSyncedAtMs: 0,
				} );

			const { container, getByText, waitForRegistry } = render(
				<PublicationOnboardingStateNotice />,
				{
					registry,
					viewContext: VIEW_CONTEXT_MAIN_DASHBOARD,
				}
			);

			await waitForRegistry();

			expect( mockTrackEvent ).toHaveBeenCalledWith(
				`${ VIEW_CONTEXT_MAIN_DASHBOARD }_rrm-onboarding-state-notification`,
				'view_notification',
				publicationState
			);

			expect( getByText( expectedText ) ).toBeInTheDocument();

			const expectedServiceURL = registry
				.select( MODULES_READER_REVENUE_MANAGER )
				.getServiceURL( {
					path: '/reader-revenue-manager',
					publicationID: 'ABCDEFGH',
				} );

			// Ensure that CTA is present and class name is correct.
			expect( getByText( ctaText ) ).toBeInTheDocument();
			expect(
				container.querySelector(
					'.googlesitekit-settings-notice__button'
				)
			).toBeInTheDocument();

			expect(
				container.querySelector(
					'.googlesitekit-cta-link.googlesitekit-cta-link--inverse'
				)
			).toHaveAttribute( 'href', expectedServiceURL );

			expect( container.firstChild ).toHaveClass(
				'googlesitekit-publication-onboarding-state-notice'
			);

			// eslint-disable-next-line require-await
			await act( async () => {
				fireEvent.click( getByText( ctaText ) );
			} );

			expect( mockTrackEvent ).toHaveBeenCalledWith(
				`${ VIEW_CONTEXT_MAIN_DASHBOARD }_rrm-onboarding-state-notification`,
				'confirm_notification',
				publicationState
			);
		}
	);
} );
