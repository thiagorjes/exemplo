import { app } from './app';
import { config } from './config';

app.listen(config.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API core ouvindo em http://localhost:${config.PORT}`);
});
