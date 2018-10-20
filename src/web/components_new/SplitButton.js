/*
 * Split Button component for wrapping multiple buttons.
 *
 * Usage:
 * <SplitButton className="">
 *   <Button text="Save" size="large" isDisabled={!this.isValid} onClick={() => { alert('hi'); }}/>
 *   <Button text="Save" width="full-width" isInProgress={this.isLoading} onClick={() => { alert('hi'); }}/>
 * </SplitButton>
 */

import classcat from 'classcat';
import React from 'react';
import {arrayOf, node, oneOfType, string} from 'prop-types';

const SplitButton = ({children, className = ''}) => {
    const classes = classcat(['split-button', className]);

    return <div className={classes}>{children}</div>;
};

SplitButton.propTypes = {
    className: string,
    children: oneOfType([arrayOf(node), node]).isRequired,
};

export default SplitButton;
