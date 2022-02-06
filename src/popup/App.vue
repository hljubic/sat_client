<template>
    <div>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"
              integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh"
              crossorigin="anonymous">

        <div class="container" style="width: 400px; padding: 0;">

            <div class="md-layout">
                <div class="md-layout-item">
                    <md-toolbar md-elevation="0">
                        <div class="md-layout md-alignment-center-left md-flexible">
                            <img src="/icons/fpmoz_48.png" alt="Avatar">
                            <h3 class="md-title">Student Activity Tracker</h3>
                        </div>
                    </md-toolbar>
                </div>
            </div>

            <div class="container">
                <br>

                <form v-if="!logoutScreen">
                    <div class="input-group mb-3">
                        <input type="text" v-model="form.username" name="username" class="form-control"
                               placeholder="AAI kor. ime" aria-label="AAI kor. ime"
                               aria-describedby="basic-addon2">
                        <div class="input-group-append">
                            <span class="input-group-text" id="basic-addon2">@sum.ba</span>
                        </div>
                    </div>

                    <div class="input-group mb-3">
                        <input type="password" class="form-control" v-model="form.password" name="password"
                               placeholder="Lozinka"
                               aria-label="Lozinka" aria-describedby="basic-addon1">
                    </div>

                    <button @click="authenthicate()" type="button" class="btn btn-primary btn-block">Prijavi se</button>
                </form>

                <div v-else>
                    Uspješno ste prijavljeni kao <b>{{ user.uid }}@sum.ba.</b>

                    <br><br>
                    <button @click="unauthenthicate()" type="button" class="btn btn-danger btn-block">Odjavi se</button>
                </div>

                <br>
                <small>Korištenjem ovog dodatka pristajete na prikupljanje podataka o korištenju preglednika prilikom
                    izrade online testova. Korištenje dodatka nije obavezno i studenti ga koriste samo ako oni to žele.
                </small>
            </div>
        </div>
    </div>
</template>

<script>
    import axios from 'axios';

    export default {
        data() {
            return {
                logoutScreen: false,
                form: {
                    username: '',
                    password: ''
                },
                user: {},
                API_BASE: 'https://tracker.hljubic.com/',
                // API_BASE: 'http://localhost/student_activity_backend/public/'
            };
        },
        computed: {},
        watch: {
            /*
            startDate: function (newVal, oldVal) {
              if (newVal.toString() !== oldVal.toString()) {
                this.checkedLogs = [];
                this.logs = [];
                this.fetchEntries();
              }
            },
             */
        },
        created() {
            let self = this;
            chrome.storage.sync.get(["aaiUser", "oldUsername"], function (result) {
                if (result.aaiUser && result.aaiUser.uid) {
                    self.user = result.aaiUser;
                    self.logoutScreen = true;
                } else {
                    self.form.username = result.oldUsername;
                }
            });
        },

        methods: {
            authenthicate() {

                axios.post('https://aai.sum.ba/korisnik/api/iss/login', this.form)
                    .then(response => {
                        chrome.storage.sync.set({'aaiUser': response.data.user}, null);
                        chrome.storage.sync.set({'oldUsername': response.data.user.uid}, null);

                        axios.post(this.API_BASE + 'store', {
                            username: response.data.user.uid,
                            link: window.location.href,
                            events: [
                                {type: 'auth', value: 'login'},
                                {type: 'platform', value: window.navigator.platform},
                                {type: 'cookies', value: window.navigator.cookieEnabled},
                                {type: 'screen_size', value: window.screen.availWidth + "," + window.screen.availHeight}
                            ]
                        });

                        this.user = response.data.user;

                        this.changeStatus(true);
                    }).catch(error => {

                    axios.post(this.API_BASE + 'store', {
                        username: this.form.username,
                        link: '',
                        events: [{type: 'auth', value: 'fail'}]
                    });
                });
            },

            unauthenthicate() {
                axios.post(this.API_BASE + 'store', {
                    username: this.user.uid,
                    link: '',
                    events: [{type: 'auth', value: 'logout'}]
                });

                chrome.storage.sync.set({'aaiUser': null}, null);

                this.logoutScreen = false;
            },

            changeStatus(logoutScreen = true) {
                this.logoutScreen = logoutScreen;
            }
        }
    };
</script>