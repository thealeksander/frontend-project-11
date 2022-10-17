import _ from 'lodash';
import * as yup from 'yup';
import onChange from 'on-change';
import getLinks from './server';
import { renderErrors, handleProcessState } from './render';

const schema = yup.object.shape({
  rss: yup.string().trim().required().url().oneOf(getLinks(), 'RSS уже существует'),
});

const validate = (filds) => {
	try {
		schema.validateSync(filds, { abortEarly: false });
		return {};
	} catch (e) {
		return _.keyBy(e.inner, 'path');
	}
};

export default () => {
	const elements = {
		form: document.querySelector('.rss-form'),
		filds: {
			rss: document.querySelector('#url-input'),
		},
		submitButton: document.querySelector('#submit'),
	};

	const state = onChange({
		searсh: {
			mode: 'filling',
			valid: true,
			data: {},
			errors: {},
		},
	}, (path, value, prevValue) => {
		switch (path) {
			case 'searсh.valid':
				elements.submitButton.disabled = !value;
				break;
			case 'search.errors':
				renderErrors(elements, value, prevValue);
				break;
			case 'search.mode':
				handleProcessState(elements, value);
				break;
			default:
				break;
		}
	});

	Object.entries(elements.filds).forEach(([fieldName, fieldElement]) => {
		fieldElement.addEventListener('input', (event) => {
			const { value } = event.target;
			state.searсh.data[fieldName] = value;

			const errors = validate(state.searсh.data);
			state.searсh.errors = errors;
			state.form.valid = _.isEmpty(errors);
		});
	});
};
