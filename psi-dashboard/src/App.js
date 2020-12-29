import React, { useEffect, useState, useContext } from "react";

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

import Post from '@Components/Post';
import PsiPanel from '@Components/PsiPanel';
import SamplePostsTable from '@Components/SamplePostsTable';
import { titleCase } from '@Utils/utils';
import { ResetButton, SaveButton, PostStatusSnackbarNotice } from '@Components/UiElements';
import { PostStatusIndicatorContext } from './contexts/PostStatusIndicatorContext';

const App = () => {
  const postStatusIndicatorContext = useContext(PostStatusIndicatorContext);
  const { settings } = postStatusIndicatorContext;
  const { isSaveDisabled } = postStatusIndicatorContext;
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
  const [ isReset, setIsReset ] = useState(false);
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
   * Reload settings when saved
   */
  useEffect(() => {
    if(isReset) {
      saveSettings();
      setTimeout(() => {
        loadSettings();
      }, 1000);
    }
  }, [isReset])
  /**
   * Our color picker that updates settings when a color changes
   * @type {function(*)}
   */
  const PsiColorPicker = ( ( status ) => {
    const colors = settings['colors'] || [];
    let color = '#808080';
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
          postStatusIndicatorContext.setIsSaveDisabled(false)
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

  /**
   * Render Panel and call our Post Status title and color picker component
   * @type {function(*)}
   */
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

  /**
   * Basic settings Panel for our plugin
   * @returns {JSX.Element}
   * @constructor
   */
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

  /**
   * Post Status title and color picker component
   * @type {function(*=)}
   */
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

  /**
   * Load settings from WordPress options table
   */
  const loadSettings = () => {
    fetch(psiSettingsEndpoint, {
      headers: psiHeaders,
    })
      .then((resp) => resp.json())
      .then((data) => {
        postStatusIndicatorContext.setSettings({ ...defaults, ...data });
        setLoaded(true);
        postStatusIndicatorContext.setIsSaveDisabled(true);
      });
  };

  /**
   * Reset options in WordPress options table
   */
  const resetSettings = ()  => {
    let psi_settings = defaults;
    // retain existing menu option so we don't get a page error
    psi_settings.psi_menu_location = settings.psi_menu_location;
    postStatusIndicatorContext.setSettings(psi_settings);
    setIsReset(true);
    postStatusIndicatorContext.setIsSaveDisabled(true);
  }

  /**
   * Save settings to WordPress options table
   */
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
            postStatusIndicatorContext.setIsSaveDisabled(true)
          }, 2000);
        } else {
          setIsSaving(false);
          console.log("Non-200 response", resp);
        }
      });
  };

  /**
   * Render our admin dashboard page
   */
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
      isSaving={isSaving}
      isSaveDisabled={isSaveDisabled}/>
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
