import {Button, Snackbar} from "@wordpress/components";
import {__} from "@wordpress/i18n";
import React, {useState} from "react";

export const ResetButton = (props) => {
  const {isSaving, onClickHandler} = props;
  return (
    <Button
      isDestructive
      icon="no"
      iconSize={100}
      isBusy={isSaving}
      onClick={onClickHandler}
    >
      {__("Reset", "psi-dashboard")}
    </Button>
  )
}

export const SaveButton = (props) => {
  const {isSaving, onClickHandler, isSaveDisabled} = props;
  return (
    <Button
      isPrimary
      isBusy={isSaving}
      disabled={isSaveDisabled}
      onClick={onClickHandler}
    >
      {__("Save", "psi-dashboard")}
    </Button>
  )
}

export const PostStatusSnackbarNotice = (props) => {
  const {isSaving} = props;
  const psiSnackStyle = {
    padding: '1rem 0',
  };
  return (
    isSaving && (
      <div style={psiSnackStyle}>
        <Snackbar>
          {__(
            "Your settings have been saved.",
            "psi-dashboard"
          )}
        </Snackbar>
      </div>
    )
  );
};
