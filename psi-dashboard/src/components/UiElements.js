import {Button} from "@wordpress/components";
import {__} from "@wordpress/i18n";
import React, {useContext, useState} from "react";
import {PostStatusIndicatorContext} from "../contexts/PostStatusIndicatorContext";

export const ResetButton = () => {
  const postStatusIndicatorContext = useContext(PostStatusIndicatorContext);
  const { settings } = postStatusIndicatorContext;
  const [ isSaving, setIsSaving ] = useState(false);

  return (
    <Button
      isDestructive
      icon="no"
      iconSize={100}
      isBusy={isSaving}
      onClick={(e) => {
        e.preventDefault();
        resetSettings();
      }}
    >
      {__("Reset", "psi-dashboard")}
    </Button>
  )
}
