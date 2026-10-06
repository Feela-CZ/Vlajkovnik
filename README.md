# Vlajkovník

Statická webová aplikace pro trénink vlajek a polohy států na slepé mapě.

## Spuštění lokálně

V adresáři projektu spusťte například:

```bash
python3 -m http.server 8000
```

Poté otevřete `http://localhost:8000`.

## Nasazení na GitHub Pages

Projekt nevyžaduje sestavení ani server. Stačí jej nahrát do repozitáře a v GitHubu zapnout Pages ze zdrojové větve / root adresáře.

Mapa je uložená lokálně v `data/countries.geojson`. Vlajky se při zobrazení načítají z veřejného CDN FlagCDN.
