import { Text, View } from 'react-native';
import { Button } from './Button';

export const EditScreenInfo = ({ path }: { path: string }) => {
  const title = 'Open up the code for this screen:';
  const description =
    'Change any of the text, save the file, and your app will automatically update.';

  return (
    <View>
      <View className={styles.getStartedContainer}>
        <Text className={styles.getStartedText}>{title}</Text>
        <View className={styles.codeHighlightContainer + styles.homeScreenFilename}>
          <Text>Justin</Text>
        </View>
        <Text className={styles.getStartedText}>{description}</Text>
        <Button
          className='bg-yellow-500'
          title="Edit this screen"
          onPress={() => console.warn('Edit this screen pressed')}
        />
      </View>
    </View>
  );
};

const styles = {
  codeHighlightContainer: `rounded-md px-1`,
  getStartedContainer: `items-center mx-6`,
  getStartedText: `text-lg leading-6 text-center`,
  helpContainer: `items-center mx-5 mt-4`,
  helpLink: `py-4`,
  helpLinkText: `text-center`,
  homeScreenFilename: `my-2`,
};
