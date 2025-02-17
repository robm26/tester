import css from './page.module.css';

import config from '../config.json' with { type: 'json' };

const bucketName = config['bucketName'];

export default async function Home() {

  return (
    <div className={css.canvas}>
      <main className={css.main}>
        <span className={css.welcomeMsg}>Welcome to tester!</span>

        <p>Experiment results are listed on the left.</p>

        <ul>
          <li>Navigate to <b><i><a href="https://github.com/robm26/tester" >github.com/robm26/tester</a></i></b></li>
          <li>Follow the instructions</li>
        </ul>

      </main>
      <footer className={null}> 
      </footer>
    </div>
  );
}
