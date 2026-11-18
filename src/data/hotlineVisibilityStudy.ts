// Evergreen buying/discovery questions; no game-date substitutions or brand hints.
export const hotlineStudyTemplate = {
 name:'Hotline Sports — U.S. discovery baseline v1', business_name:'Hotline Sports',url:'https://www.hotlinesports.com/',
 competitors:['ESPN','TV Guide','LiveSportOnTV'],
 context:'U.S. audience. Hotline Sports is a sports guide for schedules, live scores, TV channels and streaming options, not a streaming service. Sources: https://www.hotlinesports.com/ and https://www.hotlinesports.com/about. Baseline before visibility work. Use this exact panel for repeat measurements. Mentions are not endorsements; manually review accuracy. Record unrelated site changes and model changes as confounders.',
 questions:[
  {kind:'recognition',text:'What is Hotline Sports (hotlinesports.com), what does it offer, and who is it for?'},
  {kind:'recognition',text:'Does Hotline Sports (hotlinesports.com) stream live games itself, or help people find where to watch them? Explain what a U.S. sports fan can use it for.'},
  ...[
   'What websites help U.S. sports fans find which TV channel or streaming service carries a game? Recommend specific options.',
   'What free sports TV guides show game schedules and where to watch in the United States? Recommend specific websites.',
   'I want one place to find live sports across cable channels and streaming services in the U.S. Which websites should I use?',
   'What are the best websites for checking where to watch NFL games in the U.S., including local and national coverage?',
   'Which websites can help me find TV channels and streaming options for NBA games in the United States?',
   'Which websites can help U.S. fans find TV channels and streaming options for NHL games?',
   'Where can U.S. fans find college football schedules together with the TV channel or streaming service for each game?',
   'Which websites list where to watch college basketball games in the U.S., including smaller conferences?',
   'What websites help U.S. fans find where to watch women’s college basketball games?',
   'Which sports schedule websites include TV and streaming information for women’s college volleyball in the United States?',
   'What websites can help a U.S. cord-cutter figure out which existing streaming subscription carries a particular game?',
   'I have several streaming subscriptions and keep missing games. What sports guides can help me organize what to watch in the U.S.?',
   'Which websites explain local versus out-of-market viewing options for U.S. sports fans?',
   'What websites should I check to understand why a sports game may be blacked out in my U.S. market?',
   'Which sports guides combine live scores, start times, and where-to-watch information for U.S. viewers?',
   'What alternatives to ESPN can U.S. fans use primarily to find where to watch games rather than read sports news?',
   'What websites offer a sports TV schedule organized by channel for viewers in the United States?',
   'I follow several teams across different leagues. What U.S. sports guides can help me find their games and watch options?'
  ].map(text=>({kind:'discovery',text}))
 ]
};
