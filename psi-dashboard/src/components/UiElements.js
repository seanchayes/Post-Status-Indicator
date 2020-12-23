import {Button} from "@wordpress/components";
import {__} from "@wordpress/i18n";
import React, {useContext, useState} from "react";
import {PostStatusIndicatorContext} from "../contexts/PostStatusIndicatorContext";

export const ResetButton = (props) => {
  const postStatusIndicatorContext = useContext(PostStatusIndicatorContext);
  const { settings } = postStatusIndicatorContext;
  const [ isSaving, setIsSaving ] = useState(false);
  const { onClickHandler } = props;

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
