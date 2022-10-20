import _ from 'lodash';
import * as yup from 'yup';
import onChange from 'on-change';
import { renderErrors, handleProcessState } from './render';

const schema = (watchedLinks) => yup.string().trim().url().notOneOf(watchedLinks, 'RSS уже существует');

export default () => {
	const elements = {
		form: document.querySelector('.rss-form'),
		fields: {
			rss: document.querySelector('#url-input'),
		},
    feedbackEl: document.querySelector('.feedback'),
		submitButton: document.querySelector('#submit'),
	};

	const state = onChange({
		searсh: {
			state: 'filling',
			data: {},
      watchedLinks: [],
			error: null,
		},
	}, (path, value, prevValue) => {
    // console.log(path);
		switch (path) {
			case 'searсh.error':
				renderErrors(elements, value, prevValue);
				break;
			case 'search.state':
				handleProcessState(elements, value);
				break;
			default:
				break;
		}
	});

	elements.form.addEventListener('submit', (event) => {
		event.preventDefault();

    state.searсh.state = 'sending';
    const formData = new FormData(event.target);
    const url = formData.get('url');

    schema(state.searсh.watchedLinks)
      .validate(url, { abortEarly: false })
      .then((urlLink) => {
        state.searсh.error = null;
        state.searсh.watchedLinks.push(urlLink);
        return;
      })
      .catch((err) => {
        state.searсh.error = err.message;
        return;
      });
	});
};
