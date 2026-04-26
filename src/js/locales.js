export let ESCAPP_LOCALES = {
  en:{
    "i.button_ok":"OK",
    "i.button_nok":"Cancel",
    "i.button_retry":"Retry",

    "i.generic_error_title":"Error",

    "i.auth_title":"Authentication required",
    "i.auth_text":"Enter your Escapp user credentials (email and password). For this authentication to be successful, you must have previously registered for the escape room on the Escapp platform.",
    "i.auth_title_wrong_credentials":"Authentication error",
    "i.auth_text_wrong_credentials":"The credentials provided are incorrect. You need to enter your Escapp user credentials (email and password). For this authentication to be successful, you must have previously registered for the escape room on the Escapp platform.",
    "i.auth_email_label":"Email",
    "i.auth_password_label":"Password",

    "i.connection_error_title": "Connection Error",
    "i.connection_error_text": "Unable to connect to the Escapp platform.",
    
    "i.completion_title":"Escape room completed!",
    "i.completion_text":"Congratulations! You have completed the escape room.<br/>On the <a href='#{escappURL}' target='_blank'>Escapp platform</a>, you can check the leaderboard to see your final position.",

    "i.initialization_error_title":"Escapp client initialization error",
    "i.initialization_error_endpoint":"Escapp client could not be started correctly because the Escapp endpoint was not provided.",
    "i.initialization_error_endpoint_format":"Escapp client could not be started correctly because the format of the provided Escapp endpoint is incorrect.",
    "i.initialization_error_linkedPuzzleIds":"Escapp client could not be started correctly because neither resourceId nor linkedPuzzleIds were provided.",

    "i.participation_error_NOT_ACTIVE":"You are a participant in this escape room but the shift you have signed up for has not started yet.",
    "i.participation_error_NOT_AUTHENTICATED":"Authentication is required before submitting puzzle solutions.",
    "i.participation_error_NOT_PARTICIPANT":"You are not a participant in this escape room.",
    "i.participation_error_NOT_STARTED":"You are a participant in this escape room but you need to click on the 'Start' button on the Escapp platform to start the escape room.",
    "i.participation_error_TOO_LATE":"You are a participant in this escape room but the shift you have signed up for has ended or you have run out of time.",

    "i.puzzles_required": "You shouldn't be here. You must complete previous puzzles before accessing this one.",

    "i.restore_title":"Status update",
    "i.restore_auto_text":"A newer application status was found on the Escapp server. The application is going to be updated based on this status.",
    "i.restore_request_text":"A newer application status was found on the Escapp server. Do you want to update the application based on this status? If you don't, your application could be in a different state than the rest of your team members.",
  
    "i.start_title":"Do you want to start the escape room?",
    "i.start_text":"Press 'OK' to start the escape room right now or 'Cancel' to start it later.<br/>Once the escape room has been started, time will start running and it cannot be stopped.",

    "i.notification_start": "The escape room begins. Good luck #{team}!",
    "i.notification_member_join": "#{member} has joined the escape room",
    "i.notification_member_leave": "#{member} has left the escape room",
    "i.notification_hint_new": "Your team has obtained a new hint. Access the Escapp platform to read it.",
    "i.notification_puzzle_success": "Your team has solved a new puzzle.",
    "i.notification_puzzle_success_end1": "Good job #{team}!",
    "i.notification_puzzle_success_end2": "Well done #{team}!",
    "i.notification_puzzle_success_end3": "Keep up the good work #{team}!",
    
    "i.notification_ranking_1_up": "Congratulations #{team}! You are first on the leaderboard",
    "i.notification_ranking_2_up": "Awesome #{team}! You are second on the leaderboard",
    "i.notification_ranking_3_up": "Very good #{team}! You are third on the leaderboard",

    "i.notification_ranking_1_same": "Very good #{team}, you are still leading the leaderboard!",
    "i.notification_ranking_2_same": "Great #{team}, you remain in second place on the leaderboard!",
    "i.notification_ranking_3_same": "Good #{team}, you remain in third place on the leaderboard!",

    "i.notification_ranking_2_down": "#{teamOther} just overtook you on the leaderboard! Now you are second on the leaderboard",
    "i.notification_ranking_3_down": "#{teamOther} just overtook you on the leaderboard! Now you are third on the leaderboard",

    "i.notification_ranking_up": "#{team} has advanced to position #{position} on the leaderboard!",
    "i.notification_ranking_down": "#{teamOther} just overtook you! #{team} is now in position #{position} on the leaderboard",
    "i.notification_ranking_down_generic": "#{team} is now in position #{position} on the leaderboard",
    "i.notification_ranking_generic": "#{team} is in position #{position} on the leaderboard",
    
    "i.notification_ranking_1_other": "#{team} is now in first place on the leaderboard!",
    "i.notification_ranking_2_other": "#{team} is now in second place on the leaderboard!",
    "i.notification_ranking_3_other": "#{team} is now in third place on the leaderboard!",

    "i.notification_time_hours_and_minutes": "#{hours} hours and #{minutes} minutes remaining",
    "i.notification_time_one_hour_and_minutes": "One hour and #{minutes} minutes remaining",
    "i.notification_time_hours": "#{hours} hours remaining",
    "i.notification_time_one_hour": "1 hour remaining",
    "i.notification_time_minutes": "#{minutes} minutes remaining",
    "i.notification_time_one_minute": "1 minute remaining",

    "i.notification_time_runout": "Time's up!",
    "i.notification_time_runout_title": "Escape room completed",

    "i.not_supported_title":"Unsupported web browser",
    "i.not_supported_text":"We are sorry. Your web browser does not support this activity. Try a different browser.",
  },
  es:{
    "i.button_ok":"Ok",
    "i.button_nok":"Cancelar",
    "i.button_retry":"Reintentar",

    "i.generic_error_title":"Error",

    "i.auth_title":"Autenticación necesaria",
    "i.auth_text":"Introduce las credenciales (correo electrónico y contraseña) de tu usuario en la plataforma Escapp. Para que esta autenticación tenga éxito, previamente debes haberte inscrito con tu usuario a la escape room en la plataforma Escapp.",
    "i.auth_title_wrong_credentials":"Error de autenticación",
    "i.auth_text_wrong_credentials":"Las credenciales aportadas no son correctas. Debes introducir las credenciales (correo electrónico y contraseña) de tu usuario en la plataforma Escapp. Para que esta autenticación tenga éxito, previamente debes haberte inscrito con tu usuario a la escape room en la plataforma Escapp.",
    "i.auth_email_label":"Correo electrónico",
    "i.auth_password_label":"Contraseña",

    "i.connection_error_title": "Error de conexión",
    "i.connection_error_text": "No se ha podido conectar con la plataforma Escapp.",

    "i.completion_title":"¡Escape room completada!",
    "i.completion_text":"¡Enhorabuena! Has completado la escape room.<br/>En la <a href='#{escappURL}' target='_blank'>plataforma Escapp</a> puedes consultar el ranking para ver en qué posición has finalizado.",

    "i.initialization_error_title":"Error de inicialización de Escapp client",
    "i.initialization_error_endpoint":"Escapp client no se pudo iniciar correctamente porque no se proporcionó la URL de la plataforma Escapp.",
    "i.initialization_error_endpoint_format":"Escapp client no se pudo iniciar correctamente porque la URL proporcionada para acceder a la plataforma Escapp tiene un formato incorrecto.",
    "i.initialization_error_linkedPuzzleIds":"Escapp client no se pudo iniciar correctamente porque no se ha proporcionado ni resourceId ni linkedPuzzleIds.",

    "i.participation_error_NOT_ACTIVE":"Eres participante de esta escape room pero el turno al que te has apuntado aún no ha empezado.",
    "i.participation_error_NOT_AUTHENTICATED":"Es necesario autenticarse antes de enviar soluciones de retos.",
    "i.participation_error_NOT_PARTICIPANT":"No eres participante de esta escape room.",
    "i.participation_error_NOT_STARTED":"Eres participante de esta escape room pero no le has dado al botón de comenzar en la plataforma Escapp.",
    "i.participation_error_TOO_LATE":"Eres participante de esta escape room pero el turno al que te has apuntado ha terminado o te has quedado sin tiempo.",
 
    "i.puzzles_required": "No deberías estar aquí. Debes completar retos anteriores antes de acceder a este.",

    "i.restore_title":"Actualización de estado",
    "i.restore_auto_text":"Se encontró un estado más reciente de la aplicación en el servidor de Escapp. Se va a actualizar la aplicación en base a este estado.",
    "i.restore_request_text":"Se encontró un estado más reciente de la aplicación en el servidor de Escapp. ¿Quieres actualizar la aplicación en base a este estado? Si no lo haces tu aplicación podría estar en un estado diferente al del resto de miembros de tu equipo.",
    
    "i.start_title":"¿Quieres iniciar la escape room?",
    "i.start_text":"Pulsa 'Ok' para empezar la escape room ahora mismo o 'Cancelar' para iniciarla en otro momento.<br/>Una vez iniciada la escape room, empezará a correr el tiempo y éste no podrá ser detenido.",
      
    "i.notification_start": "Empieza la escape room. ¡Suerte #{team}!",
    "i.notification_member_join": "#{member} se ha unido a la escape room",
    "i.notification_member_leave": "#{member} ha abandonado la escape room",
    "i.notification_hint_new": "Tu equipo ha conseguido una nueva pista. Accede a la plataforma Escapp para consultarla.",
    "i.notification_puzzle_success": "Tu equipo ha superado un nuevo reto.",
    "i.notification_puzzle_success_end1": "¡Buen trabajo #{team}!",
    "i.notification_puzzle_success_end2": "¡Bien hecho #{team}!",
    "i.notification_puzzle_success_end3": "¡Seguid así #{team}!",

    "i.notification_ranking_1_up": "¡Enhorabuena #{team}! Vais primeros en la clasificación",
    "i.notification_ranking_2_up": "¡Genial #{team}! Vais segundos en la clasificación",
    "i.notification_ranking_3_up": "¡Muy bien #{team}! Vais terceros en la clasificación",

    "i.notification_ranking_1_same": "Muy bien #{team}, ¡seguís encabezando la clasificación!",
    "i.notification_ranking_2_same": "Estupendo #{team}, ¡seguís segundos en la clasificación!",
    "i.notification_ranking_3_same": "Bien #{team}, ¡seguís terceros en la clasificación!",

    "i.notification_ranking_2_down": "¡#{teamOther} os acaba de adelantar en la clasificación! Ahora vais segundos",
    "i.notification_ranking_3_down": "¡#{teamOther} os acaba de adelantar en la clasificación! Ahora vais terceros",

    "i.notification_ranking_up": "¡#{team} ha avanzado al puesto #{position} de la clasificación!",
    "i.notification_ranking_down": "¡#{teamOther} os acaba de adelantar! #{team} ahora ocupa el puesto #{position} de la clasificación",
    "i.notification_ranking_down_generic": "#{team} ahora ocupa el puesto #{position} de la clasificación",
    "i.notification_ranking_generic": "#{team} está en el puesto #{position} de la clasificación",

    "i.notification_ranking_1_other": "#{teamOther} se ha colocado en la primera posición de la clasificación",
    "i.notification_ranking_2_other": "#{teamOther} se ha colocado en la segunda posición de la clasificación",
    "i.notification_ranking_3_other": "#{teamOther} se ha colocado en la tercera posición de la clasificación",

    "i.notification_time_hours_and_minutes": "Faltan #{hours} horas y #{minutes} minutos para que se agote el tiempo",
    "i.notification_time_one_hour_and_minutes": "Falta 1 hora y #{minutes} minutos para que se agote el tiempo",
    "i.notification_time_hours": "Faltan #{hours} horas para que se agote el tiempo",
    "i.notification_time_one_hour": "Falta 1 hora para que se agote el tiempo",
    "i.notification_time_minutes": "Faltan #{minutes} minutos para que se agote el tiempo",
    "i.notification_time_one_minute": "Falta 1 minuto para que se agote el tiempo",
    "i.notification_time_runout": "¡Se ha agotado el tiempo!",
    "i.notification_time_runout_title": "Escape room finalizada",

    "i.not_supported_title":"Navegador web no soportado",
    "i.not_supported_text":"Lo sentimos. Tu navegador web no permite realizar esta actividad. Prueba con otro navegador.",
  },
  sr:{
    "i.button_ok":"U redu",
    "i.button_nok":"Otkaži",
    "i.button_retry":"Pokušaj ponovo",

    "i.generic_error_title":"Greška",

    "i.auth_title":"Potrebna je autentifikacija",
    "i.auth_text":"Unesite svoje Escapp korisničke akreditive (e-poštu i lozinku). Da bi ova autentifikacija bila uspešna, morate se prethodno registrovati sa svojim korisničkim imenom u escape sobi na Escapp platformi.",
    "i.auth_title_wrong_credentials":"Greška pri autentifikaciji",
    "i.auth_text_wrong_credentials":"Uneti akreditivi nisu ispravni. Potrebno je da unesete svoje Escapp korisničke akreditive (e-poštu i lozinku). Da bi ova autentifikacija bila uspešna, morate se prethodno registrovati sa svojim korisničkim imenom u escape sobi na Escapp platformi.",
    "i.auth_email_label":"Email",
    "i.auth_password_label":"Lozinka",

    "i.connection_error_title": "Greška u povezivanju",
    "i.connection_error_text": "Nije moguće povezati se sa Escapp platformom.",
    
    "i.completion_title":"Escape soba završena!",
    "i.completion_text":"Čestitamo! Završili ste escape sobu.<br/>Na <a href='#{escappURL}' target='_blank'>Escapp platformi</a> možete proveriti tabelu da biste videli na kojoj ste poziciji završili.",

    "i.initialization_error_title":"Greška pri inicijalizaciji Escapp klijenta",
    "i.initialization_error_endpoint":"Escapp klijent nije mogao biti ispravno pokrenut jer krajnja tačka (endpoint) Escapp-a nije navedena.",
    "i.initialization_error_endpoint_format":"Escapp klijent nije mogao biti ispravno pokrenut jer je format navedene krajnje tačke (endpoint) Escapp-a netačan.",
    "i.initialization_error_linkedPuzzleIds":"Escapp klijent nije mogao biti ispravno pokrenut jer nisu navedeni ni resourceId ni linkedPuzzleIds.",

    "i.participation_error_NOT_ACTIVE":"Vi ste učesnik ove escape sobe, ali smena za koju ste se prijavili još nije počela.",
    "i.participation_error_NOT_AUTHENTICATED":"Potrebna je autentifikacija pre slanja rešenja zagonetki.",
    "i.participation_error_NOT_PARTICIPANT":"Niste učesnik ove escape sobe.",
    "i.participation_error_NOT_STARTED":"Vi ste učesnik ove escape sobe, ali morate da kliknete na dugme „Start“ na Escapp platformi da biste pokrenuli escape sobu.",
    "i.participation_error_TOO_LATE":"Vi ste učesnik ove escape sobe, ali smena za koju ste se prijavili je završena ili vam je isteklo vreme.",

    "i.puzzles_required": "Vi ne bi trebalo da budete ovde. Morate da završite prethodne zagonetke pre nego što pristupite ovoj.",

    "i.restore_title":"Ažuriranje statusa",
    "i.restore_auto_text":"Noviji status aplikacije je pronađen na Escapp serveru. Aplikacija će biti ažurirana na osnovu ovog statusa.",
    "i.restore_request_text":"Noviji status aplikacije je pronađen na Escapp serveru. Da li želite da ažurirate aplikaciju na osnovu ovog statusa? Ako to ne učinite, vaša aplikacija bi mogla biti u drugačijem stanju od ostalih članova vašeg tima.",
  
    "i.start_title":"Da li želite da pokrenete escape sobu?",
    "i.start_text":"Pritisnite 'U redu' da biste odmah pokrenuli escape sobu ili 'Otkaži' da biste je pokrenuli kasnije.<br/>Kada se escape soba pokrene, vreme će početi da teče i ne može se zaustaviti.",

    "i.notification_start": "Escape soba počinje. Srećno #{team}!",
    "i.notification_member_join": "#{member} se pridružio escape room-u",
    "i.notification_member_leave": "#{member} je napustio escape room",
    "i.notification_hint_new": "Vaš tim je dobio novi savet (hint). Pristupite Escapp platformi da biste ga pročitali.",
    "i.notification_puzzle_success": "Vaš tim je rešio novu zagonetku.",
    "i.notification_puzzle_success_end1": "Dobro odrađeno #{team}!",
    "i.notification_puzzle_success_end2": "Veoma dobro #{team}!",
    "i.notification_puzzle_success_end3": "Samo nastavite sa dobrim radom #{team}!",
    
    "i.notification_ranking_1_up": "Čestitamo #{team}! Prvi ste na tabeli",
    "i.notification_ranking_2_up": "Odlično #{team}! Drugi ste na tabeli",
    "i.notification_ranking_3_up": "Vrlo dobro #{team}! Treći ste na tabeli",

    "i.notification_ranking_1_same": "Vrlo dobro #{team}, nastavljate da vodite na tabeli!",
    "i.notification_ranking_2_same": "Odlično #{team}, nastavljate da budete drugi na tabeli!",
    "i.notification_ranking_3_same": "Dobro #{team}, nastavljate da budete treći na tabeli!",

    "i.notification_ranking_2_down": "#{teamOther} vas je upravo pretekao na tabeli! Sada ste drugi na tabeli",
    "i.notification_ranking_3_down": "#{teamOther} vas je upravo pretekao na tabeli! Sada ste treći na tabeli",

    "i.notification_ranking_up": "#{team} je napredovao na poziciju #{position} na tabeli!",
    "i.notification_ranking_down": "#{teamOther} vas je upravo pretekao! #{team} je sada na poziciji #{position} na tabeli.",
    "i.notification_ranking_down_generic": "#{team} je sada na poziciji #{position} na tabeli.",
    "i.notification_ranking_generic": "#{team} je na poziciji #{position} na tabeli.",
    
    "i.notification_ranking_1_other": "#{team} je sada na prvoj poziciji tabele!",
    "i.notification_ranking_2_other": "#{team} je sada na drugoj poziciji tabele!",
    "i.notification_ranking_3_other": "#{team} je sada na trećoj poziciji tabele!",

    "i.notification_time_hours_and_minutes": "#{hours} sati i #{minutes} minuta do isteka vremena.",
    "i.notification_time_one_hour_and_minutes": "Jedan sat i #{minutes} minuta do isteka vremena.",
    "i.notification_time_hours": "#{hours} sati do isteka vremena.",
    "i.notification_time_one_hour": "1 sat do isteka vremena.",
    "i.notification_time_minutes": "#{minutes} minuta do isteka vremena.",
    "i.notification_time_one_minute": "1 minut do isteka vremena.",
    "i.notification_time_runout": "Vreme je isteklo!",
    "i.notification_time_runout_title": "Escape soba završena.",

    "i.not_supported_title":"Nepodržani veb pregledač (browser).",
    "i.not_supported_text":"Žao nam je. Vaš veb pregledač (browser) ne dozvoljava izvršavanje ove aktivnosti. Pokušajte sa drugim pregledačem.",
  },

};