import React from 'react';
import {array, func, oneOfType, string} from 'prop-types';

import Button from '../components_new/Button';
import Hint from '../components_new/Hint';
import ParagraphWrapper from '../components_new/ParagraphWrapper';
import {Dialog, DialogActions, DialogHeader} from '../components_new/Dialog';

const Alert = ({buttonText = 'ok', heading, onClose, text}) => (
  <Dialog width="wide" onClose={onClose}>
    <DialogHeader heading={heading} />
    {Array.isArray(text) ? (
      <Hint block className="text--centered u-mr+ u-mb u-ml+">
        {text.map((paragraph, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <ParagraphWrapper key={i} data={paragraph} type="HTML" wrapIn="p" className="u-mb-" />
        ))}
      </Hint>
    ) : (
      <Hint block className="text--centered u-mr+ u-mb u-ml+">
        {text}
      </Hint>
    )}
    <DialogActions>
      <Button text={buttonText} handleClick={onClose} />
    </DialogActions>
  </Dialog>
);

Alert.propTypes = {
  buttonText: string,
  heading: string.isRequired,
  onClose: func.isRequired,
  text: oneOfType([string, array]).isRequired,
};

export default Alert;
