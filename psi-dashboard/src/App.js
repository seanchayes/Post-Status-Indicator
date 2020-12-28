import React, { useEffect, useState, memo, useContext } from "react";
import axios from "axios";
import Post from '@Components/Post';
import {
  ColorPicker,
  Button,
  Notice,
  ComboboxControl,
  Snackbar,
  Panel,
  PanelBody,
  PanelRow,
  HorizontalRule,
  Spinner
} from '@wordpress/components';
import { __ } from "@wordpress/i18n";
import PsiPanel from '@Components/PsiPanel';
import SamplePostsTable from '@Components/SamplePostsTable';
import { titleCase } from '@Utils/utils';
import { ResetButton, SaveButton, PostStatusSnackbarNotice } from '@Components/UiElements';

import { PostStatusIndicatorContext } from './contexts/PostStatusIndicatorContext';

const App = () => {
  const postStatusIndicatorContext = useContext(PostStatusIndicatorContext);
  const { settings } = postStatusIndicatorContext;
  const defaults = {
    psi_menu_location: "own_menu",
    color_post_labels: false,
    colors: []
  };
  const [ posts, setPosts ] = useState([]);
  const [ postStatus, setPostStatus ] = useState('draft');
  const [ filteredOptions, setFilteredOptions ] = useState([]);
  const [ loaded, setLoaded ] = useState(false);
  const [ isSaving, setIsSaving ] = useState(false);
  const options = [];
  const psiSaveStyle = {
    padding: '1rem 0',
  };
  const rest_url = window.psi_config.rest_url;
  const namespace = window.psi_config.namespace;

  const psiSettingsEndpoint = rest_url + namespace + "/settings";
  const psiHeaders = {
    'X-WP-Nonce': window.psi_config.nonce
  };
  /**
   * Load our settings, set our settings and be ready
   */
  useEffect(() => {
    loadSettings();
    setPosts(psi_config.posts);
    Object.keys(psi_config.stati).forEach( (status) => {
      let titleWord = titleCase(status);
      options.push( { "value" : status, "label" : titleWord[0] } );
    });
    setFilteredOptions(options);
  }, []);

  /**
   * Our color picker that updates settings when a color changes
   * @type {function(*)}
   */
  const PsiColorPicker = ( ( status ) => {
    const colors = settings['colors'] || [];
    let color = '#ff9900';
    if(colors.length) {
      const colorAlreadySet = colors.find(({name}) => name === status.status);
      if( undefined !== colorAlreadySet ) {
        color = colorAlreadySet.value
      }
    }
    return (
      <ColorPicker
        color={color}
        onChangeComplete={( value ) => {
          postStatusIndicatorContext.updateColor( status, value.hex );
        }}
        disableAlpha
      />
    );
  });

  /**
   * Function to choose which Post Status color to modify
   * @returns {JSX.Element}
   */
  function postStatusDropdownSelector() {
    return (
      <ComboboxControl
        label="Post Status"
        value={postStatus}
        onChange={setPostStatus}
        options={filteredOptions}
        onFilterValueChange={(value) => value}
        onInputChange={(inputValue) =>
          setFilteredOptions(
            options.filter(option =>
              option.label.toLowerCase().startsWith(inputValue.toLowerCase())
            )
          )
        }
      />
    );
  }

  const PostStatusIndicatorColorPicker = ( ( postStatus ) => {
    const { status } = postStatus;
    return (
      <Panel header="Color">
        <PanelBody>
          <PanelRow>
            {PostStatusItem(status)}
          </PanelRow>
        </PanelBody>
      </Panel>
    )
  });

  const PostStatusSettings = () => {
    return (
      <Panel header="Settings">
        <PanelBody>
          <PsiPanel />
          <PanelRow>
            {__("Reset colors to default: Choosing this option will remove all color settings for each Post Status", "psi-dashboard")}
          </PanelRow>
          <PanelRow>
            <ResetButton onClickHandler={(e) => {
              e.preventDefault();
              resetSettings();
            }}
            isSaving={isSaving}/>
          </PanelRow>
        </PanelBody>
      </Panel>
    )
  }

  const PostStatusItem = ( (status) => {
    return (
      <PanelRow>
        <div key={status} className={status}>
          <h3>{titleCase(status) ?? "Choose status"}</h3>
          <PsiColorPicker status={status}/>
          {postStatusDropdownSelector()}
        </div>
      </PanelRow>
    )
  });

  const loadSettings = () => {
    fetch(psiSettingsEndpoint, {
      headers: psiHeaders,
    })
      .then((resp) => resp.json())
      .then((data) => {
        postStatusIndicatorContext.setSettings({ ...defaults, ...data });
        setLoaded(true);
      });
  };

  const resetSettings = ()  => {
    let psi_settings = defaults;
    // retain existing menu option so we don't get a page error
    psi_settings.psi_menu_location = settings.psi_menu_location;
    postStatusIndicatorContext.setSettings(psi_settings);
  }

  const saveSettings = () => {
    setIsSaving(true);
    var request = new Request(
      psiSettingsEndpoint,
      {
        method: "POST",
        body: JSON.stringify(settings),
        headers: {
          "Content-Type": "application/json",
          'X-WP-Nonce': window.psi_config.nonce
        },
      }
    );
    fetch(request)
      .then((resp) => {
        if(200=== resp.status) {
          setTimeout(() => {
            setIsSaving(false);
          }, 2000);
        } else {
          setIsSaving(false);
          console.log("Non-200 response", resp);
        }
      });
  };

  return (
  <>
    <h1>Post Status Indicator</h1>
    {!loaded && <Spinner /> || (
      <div className={"psi-color-picker-grid"}>
        <PostStatusIndicatorColorPicker status={postStatus} />
        <PostStatusSettings />
      </div>)}
    {loaded && !isSaving && (
      <div style={psiSaveStyle}>
      <SaveButton onClickHandler={(e) => {
        e.preventDefault();
        saveSettings();
      }}
      isSaving={isSaving}/>
      </div>
    )}
    {loaded && isSaving && <PostStatusSnackbarNotice isSaving={isSaving}/>}
    {loaded && (
      <>
        <h4>Sample all posts screen to review your color choices</h4>
        <SamplePostsTable posts={posts} />
      </>
    )}
  </>
  );
}

export default App;
