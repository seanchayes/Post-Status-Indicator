import { useState, createContext } from "@wordpress/element";

export const PostStatusIndicatorContext = createContext();

function PostStatusIndicatorContextProvider(props) {
  const [ settings, setSettings ] = useState({});
  const [ isLoading, setIsLoading ] = useState(true);
  const [ color, setColor ] = useState([]);
  const [ isSaveDisabled, setIsSaveDisabled ] = useState(true);

  const updateSetting = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const updateColor = (key, value) => {
    // Does this color exist and therefore we update it
    // const result = settings['colors'].find(({ name }) => name === key.status);
    // Or do we just add the color?
    //Add
    if(settings['colors'] === undefined) {
      settings['colors'] = new Array;
    }
    const colors = settings['colors'] || [];
    const result = colors.find(({ name }) => name === key.status);
    if(result !== undefined) {
      const filteredColors = settings['colors'].filter(({ name }) => name !== key.status)
      settings['colors'] = filteredColors;
    }
    settings['colors'].push({ 'name': key.status, value: value } );
    setSettings({ ...settings });
  };

  return (
    <PostStatusIndicatorContext.Provider
      value={{
        settings,
        setSettings,
        updateSetting,
        updateColor,
        setColor,
        isLoading,
        setIsLoading,
        isSaveDisabled,
        setIsSaveDisabled
      }}
    >
      {props.children}
    </PostStatusIndicatorContext.Provider>
  );
}

export default PostStatusIndicatorContextProvider;
