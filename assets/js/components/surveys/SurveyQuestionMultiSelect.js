/**
 * SurveyQuestionMultiSelect component.
 *
 * Site Kit by Google, Copyright 2021 Google LLC
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
 * External dependencies
 */
import PropTypes from 'prop-types';
import keyBy from 'lodash/keyBy';

/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import Button from '../Button';
import Checkbox from '../Checkbox';
import SurveyHeader from './SurveyHeader';
import { TextField, Input } from '../../material-components';

const MAXIMUM_CHARACTER_LIMIT = 100;

const SurveyQuestionMultiSelect = ( {
	question,
	choices,
	answerQuestion,
	dismissSurvey,
	minChoices = 1,
	maxChoices,
} ) => {
	// eslint-disable-next-line camelcase
	const mappedChoices = choices.map( ( { answer_ordinal, write_in } ) => {
		// write_in means we need to support free text for that option (answer_text holds this in state).
		const optionalKeys = write_in ? { answer_text: '' } : {}; // eslint-disable-line camelcase

		return {
			answer_ordinal,
			selected: false,
			...optionalKeys,
		};
	} );

	const initialState = keyBy( mappedChoices, 'answer_ordinal' );

	const [ selectedValues, setSelectedValues ] = useState( initialState );

	// eslint-disable-next-line camelcase
	const handleCheck = ( answer_ordinal ) => {
		const newState = {
			...selectedValues,
			[ answer_ordinal ]: {
				...selectedValues[ answer_ordinal ],
				selected: ! selectedValues[ answer_ordinal ].selected,
			},
		};

		setSelectedValues( newState );
	};

	// eslint-disable-next-line camelcase
	const handleAnswerChange = ( event, answer_ordinal ) => {
		const newState = {
			...selectedValues,
			[ answer_ordinal ]: {
				...selectedValues[ answer_ordinal ],
				answer_text: event.target.value?.slice(
					0,
					MAXIMUM_CHARACTER_LIMIT
				),
			},
		};

		setSelectedValues( newState );
	};

	const handleSubmit = () => {
		const answer = Object.values( selectedValues )
			.filter( ( { selected } ) => selected )
			// eslint-disable-next-line camelcase
			.map( ( { answer_ordinal, answer_text } ) => {
				// eslint-disable-next-line camelcase
				if ( answer_text ) {
					return { answer_ordinal, answer_text };
				}
				return { answer_ordinal };
			} );
		answerQuestion( {
			answer,
		} );
	};

	const hasEmptySelectedTextValue =
		// eslint-disable-next-line camelcase
		choices.filter( ( { write_in, answer_ordinal } ) => {
			// eslint-disable-next-line camelcase
			if ( write_in ) {
				// eslint-disable-next-line camelcase
				const { selected, answer_text } = selectedValues[
					answer_ordinal
				];
				if ( selected && answer_text.length === 0 ) {
					return true;
				}
			}
			return false;
		} ).length > 0;

	const totalSelectedValues = Object.values( selectedValues ).filter(
		( { selected } ) => selected
	).length;
	const hasLessThanMinChoices = totalSelectedValues < minChoices;
	const hasMoreThanMaxChoices =
		maxChoices && totalSelectedValues > maxChoices;

	const isSubmitButtonDisabled =
		hasEmptySelectedTextValue ||
		hasLessThanMinChoices ||
		hasMoreThanMaxChoices;

	return (
		<div className="googlesitekit-survey__multi-select">
			<SurveyHeader title={ question } dismissSurvey={ dismissSurvey } />

			<div className="googlesitekit-survey__body">
				{
					// eslint-disable-next-line camelcase
					choices.map( ( { answer_ordinal, text, write_in } ) => {
						const answer = selectedValues[ answer_ordinal ];

						return (
							<div
								key={ text }
								className="googlesitekit-survey__multi-select__option"
							>
								<Checkbox
									checked={ answer.selected }
									onChange={ () =>
										handleCheck( answer_ordinal )
									}
									// eslint-disable-next-line camelcase
									value={ `${ answer_ordinal }` }
									id={ text }
									name={ text }
								>
									{ text }
								</Checkbox>
								{
									// eslint-disable-next-line camelcase
									write_in && (
										<TextField>
											<Input
												onChange={ ( event ) =>
													handleAnswerChange(
														event,
														answer_ordinal
													)
												}
												value={ answer.answer_text }
												disabled={ ! answer.selected }
												aria-label={ `Text input for option ${ text }` }
											/>
										</TextField>
									)
								}
							</div>
						);
					} )
				}
			</div>

			<div className="googlesitekit-survey__footer">
				<Button
					onClick={ handleSubmit }
					disabled={ isSubmitButtonDisabled }
				>
					Next
				</Button>
			</div>
		</div>
	);
};

SurveyQuestionMultiSelect.propTypes = {
	question: PropTypes.string.isRequired,
	choices: PropTypes.arrayOf(
		PropTypes.shape( {
			answer_ordinal: PropTypes.oneOfType( [
				PropTypes.string,
				PropTypes.number,
			] ),
			text: PropTypes.string,
			write_in: PropTypes.bool,
		} )
	).isRequired,
	answerQuestion: PropTypes.func.isRequired,
	dismissSurvey: PropTypes.func.isRequired,
	minChoices: PropTypes.number,
	maxChoices: PropTypes.number,
};

export default SurveyQuestionMultiSelect;
