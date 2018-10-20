import React from 'react';
import {array, func, oneOf, oneOfType, string} from 'prop-types';

import FormActions from '../components_new/FormActions';
import ParagraphWrapper from '../components_new/ParagraphWrapper';
import {Dialog, DialogActions, DialogHeader} from '../components_new/Dialog';

const Confirm = ({buttonText = 'ok', heading, onClose, onConfirm, text, width = 'wide'}) => (
  <Dialog width={width} onClose={onClose}>
    <DialogHeader heading={heading} />
    {Array.isArray(text) ? (
      <div className="text--centered u-mb+ u-mh+">
        {text.map((paragraph, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <ParagraphWrapper key={i} data={paragraph} type="HTML" wrapIn="p" className="u-mb-" />
        ))}
      </div>
    ) : (
      <div className="text--centered u-mb+ u-mh+">{text}</div>
    )}
    <DialogActions>
      <FormActions
        primaryAction={{
          onClick: onConfirm,
          text: buttonText,
        }}
        secondaryAction={{
          onClick: onClose,
        }}
        noPad
      />
    </DialogActions>
  </Dialog>
);

Confirm.propTypes = {
  buttonText: string,
  heading: string.isRequired,
  onClose: func.isRequired,
  onConfirm: func.isRequired,
  text: oneOfType([string, array]).isRequired,
  width: oneOf(['normal', 'wide', 'extraWide', 'full']),
};

export default Confirm;
