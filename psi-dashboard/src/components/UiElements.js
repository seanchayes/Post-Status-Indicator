import {Button, Snackbar} from "@wordpress/components";
import {__} from "@wordpress/i18n";
import React, {useContext, useState} from "react";
import {PostStatusIndicatorContext} from "../contexts/PostStatusIndicatorContext";

export const ResetButton = (props) => {
  const postStatusIndicatorContext = useContext(PostStatusIndicatorContext);
  const { settings } = postStatusIndicatorContext;
  const [ isSaving, setIsSaving ] = useState(false);
  const { onClickHandler } = props;
  const psiSnackStyle = {
    padding: '1rem 0',
  };

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

export const SaveButton = () => {
  return (
    <Button
      isPrimary
      isBusy={isSaving}
      onClick={onClickHandler}
    >
      {__("Save", "psi-dashboard")}
    </Button>
  )
}

export  const PostStatusSnackbarNotice = () => {
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
