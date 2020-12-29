import React, {useContext, useState} from "react";
import {Button, PanelRow, RadioControl, CheckboxControl, HorizontalRule} from "@wordpress/components";
import { PostStatusIndicatorContext } from '@Contexts/PostStatusIndicatorContext';
import { __ } from "@wordpress/i18n";

const PsiPanel = () => {
  const postStatusIndicatorContext = useContext(PostStatusIndicatorContext);
  const { settings } = postStatusIndicatorContext;
  if (
    postStatusIndicatorContext.settings === {} ||
    !postStatusIndicatorContext.settings.psi_menu_location
  ) {
    return null;
  }
  else {
    return (
      <>
        <PanelRow>
          <RadioControl
            label="Post Status Indicator menu location"
            help="Where to locate this options menu for Post Status Indicator"
            selected={postStatusIndicatorContext.settings.psi_menu_location}
            options={[
              {
                value: "own_menu",
                label: __(
                  "Top level menu (default)",
                  "psi-dashboard"
                ),
              },
              {
                value: "settings_menu",
                label: __(
                  "Child of Settings menu",
                  "psi-dashboard"
                ),
              },
              {
                value: "tools_menu",
                label: __(
                  "Child of Tools menu",
                  "psi-dashboard"
                ),
              },
            ]}
            onChange={(value) => {
              postStatusIndicatorContext.updateSetting(
                "psi_menu_location",
                value
              );
              postStatusIndicatorContext.setIsSaveDisabled(false);
            }}
          />
        </PanelRow>
        <HorizontalRule />
        <PanelRow>
          <CheckboxControl
            label="Color post labels?"
            checked={ postStatusIndicatorContext.settings.color_post_labels }
            onChange={(value) => {
              postStatusIndicatorContext.updateSetting(
                "color_post_labels",
                value
              );
            }}
          />
        </PanelRow>
        <HorizontalRule />
      </>
    );

  }
};

export default PsiPanel;
