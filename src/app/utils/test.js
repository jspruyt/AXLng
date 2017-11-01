this.carSubject
    .distinctUntilChanged()
    .do(() => { this.models = []; this.loading = true; this.error = false; })
    .switchMap(url => this.carService.getModels(url))
    .subscribe((models: any[]) => {
        this.error = data.error;
        this.models = data.models;
        this.loading = false;
    });


getModels(url) {
    return this.http
        .get(url)
        .map(response => response.json().models)
        .catch(error => Observable.of({ error: true }))
        .flatMap(models => 
            Observable
            .forkJoin(
                models.length ? 
                models.map(url => this.http.get(url)
                    .map(response => response.json())
                    .catch(e => Observable.of({ notLoaded: true, name: `ERROR Loading ${url}!` })))
                : Observable.of({ error: models.error }))
            .map((res: any) => { return { models: res, error: (res[0] || {}).error } }));
}