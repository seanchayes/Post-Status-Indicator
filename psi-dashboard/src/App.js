import React, { useEffect, useState, memo, useContext } from "react";
import axios from "axios";
import Post from './components/Post';
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
import PsiPanel from './components/PsiPanel';
import SamplePostsTable from './components/SamplePostsTable';
import { titleCase } from './utils';

import { PostStatusIndicatorContext } from './contexts/PostStatusIndicatorContext';

const App = () => {
  const postStatusIndicatorContext = useContext(PostStatusIndicatorContext);
  const { settings } = postStatusIndicatorContext;
  const defaults = {
    "psi_menu_location": "own_menu",
    "color_post_labels": false,
    "colors": []
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
    const colors = settings['colors'];
    const colorAlreadySet = colors.find(({name}) => name === status.status);
    let color = '#ff9900';
    if(colorAlreadySet) {
      color = colorAlreadySet.value
    }
    return (
      <ColorPicker
        color={ color }
        onChangeComplete={ ( value ) => {
          postStatusIndicatorContext.updateColor( status, value.hex );
        } }
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
            <h4>Reset colors to default</h4>
            <ResetButton />
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

  const SaveButton = () => {
    return (
      <Button
        isPrimary
        isBusy={isSaving}
        onClick={(e) => {
          e.preventDefault();
          saveSettings();
        }}
      >
        {__("Save", "psi-dashboard")}
      </Button>
    )
  }
  const ResetButton = () => {
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

  const loadSettings = () => {
    const rest_url = window.psi_config.rest_url;
    const namespace = window.psi_config.namespace;

    fetch(rest_url + namespace + "/optionsettings")
      .then((resp) => resp.json())
      .then((data) => {
        postStatusIndicatorContext.setSettings({ ...defaults, ...data });
        setLoaded(true);
      });
  };

  const resetSettings = ()  => {
    let psi_settings = Object.create(defaults);
    // retain existing menu option so we don't get a page error
    psi_settings.psi_menu_location = settings.psi_menu_location;
    postStatusIndicatorContext.setSettings(psi_settings);
    saveSettings();
  }

  const saveSettings = () => {
    setIsSaving(true);
    const rest_url = window.psi_config.rest_url;
    const namespace = window.psi_config.namespace;
    var request = new Request(
      rest_url + namespace + "/optionsettings",
      {
        method: "POST",
        body: JSON.stringify(settings),
        headers: { "Content-Type": "application/json" },
      }
    );
    fetch(request)
      .then((resp) => {
        if(200=== resp.status) {
          setTimeout(() => {
            setIsSaving(false);
          }, 2200);
        } else {
          console.log("Non-200 response", resp);
        }
      });
  };

  const savingNotice = () => {
    return (
      isSaving && (
        <Notice status="success" isDismissible={false}>
          <p>
            {__(
              "Your settings have been saved.",
              "psi-dashboard"
            )}
          </p>
        </Notice>
      )
    )
  }
  const PostStatusSnackbarNotice = () => {
    return (
      isSaving && (
        <div style={psiSaveStyle}>
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
      <SaveButton />
      </div>
      )}
    {loaded && PostStatusSnackbarNotice()}
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
