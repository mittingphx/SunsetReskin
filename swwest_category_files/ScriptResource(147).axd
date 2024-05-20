// Name:        Seadragon.Seadragon.Config.debug.js
// Assembly:    AjaxControlToolkit
// Version:     4.1.7.1213
// FileVersion: 4.1.7.1213
// (c) 2010 CodePlex Foundation
Type.registerNamespace('Sys.Extended.UI.Seadragon');
Type.registerNamespace('Seadragon');
Sys.Extended.UI.Seadragon.Config = function() {

    this.debugMode = true;

    this.animationTime = 1.5;

    this.blendTime = 0.5;

    this.alwaysBlend = false;

    this.autoHideControls = true;

    this.immediateRender = false;

    this.wrapHorizontal = false;

    this.wrapVertical = false;

    this.minZoomDimension = 0.8;

    this.maxZoomPixelRatio = 2;

    this.visibilityRatio = 0.5;

    this.springStiffness = 5.0;

    this.imageLoaderLimit = 2;

    this.clickTimeThreshold = 200;

    this.clickDistThreshold = 5;

    this.zoomPerClick = 2.0;

    this.zoomPerSecond = 2.0;

    this.showNavigationControl = true;

    this.maxImageCacheCount = 100;

    this.minPixelRatio = 0.5;

    this.mouseNavEnabled = true;

    this.navImages = {
        zoomIn: {
            REST: 'WebResource.axd?d=h70ZLo_wYwRc6_4xjicN9vXLDH5Q_B_jsI_vKLcJiMCOjnwIZjzULrToQZCF2UchbDj1tjYe3CyaLiENGAP6Lg2ZADP0KsLBNDIccey1OcJFQ74-syO7wxP-EeoYjWlm2Ju0gScqiMfyN2NTFs23Hw2&t=637152258930000000',
            GROUP: 'WebResource.axd?d=zfWCBXuZO9u8R7py4xDoAvTxZ3sIEZ7_7LI6xuBpOHRHPRFwt0i7TF7T1evlbHMsTbWT4uj59Fs6u9672g9ZGy8F3YT0-Bf39nQ-Q3yB_F3Xvle3oolP4zE1YEHeQmvlfD6MeDg2tmeU0BLY3Mnn0UB89-It8pd6gU5arSYDoOo1&t=637152258930000000',
            HOVER: 'WebResource.axd?d=tIdnMxdxu3tGDafuWDySm-8EOqLMnG5wjy7zCtWQreRWU1gC6Z6V-VhsccrZz8BtRI-52QqZWutQmI3EQI8iP_dd7GhLeB66K6iXO7aDpKCN1xHn5nT5k1PrkpZB932-JDJauhrvEz-1iMCi6XlTSQ2&t=637152258930000000',
            DOWN: 'WebResource.axd?d=SmyldhfIBBsVt9b6y8aUp0loab0YRDmusuSn27hXF8SXxmGhtOu9MHiLEeUZ1t8Z_y7XyHGobEorbLd3d2HokwjrhAXpGZHDidTbjf5BqAM7XQpVTlFU95S1UV45qEWw9z0JcOXdh3C1Ojg0hUnpKw2&t=637152258930000000'
        },
        zoomOut: {
            REST: 'WebResource.axd?d=sU9tmY1pm0aI7rBl8zSXYqGoGlMUyIwpWVG3rxB8EyrQPJgYomy6WLQMPrQxAsIF1q4-TyGMEQnlwoG9-oDiRF65wW1UQPlj9TEC31R5AGxLbAeBuIOtBBrCrgDlxI58HXsiP6pfnPqQ5kn3THW5sA2&t=637152258930000000',
            GROUP: 'WebResource.axd?d=1oL1VsB-4-ZpnvWUqKcDuVdN8D-a0ceKpGm-BhHUDcZwLouxLYdxlXgEMImktNlSJVsDl3E-SwFyFPvGIHUEEmHn0v88Z89NwI7pbO4q7vyiPLGbd7MDCv_NIZ6zN273wqe48GIISbOlQdnXzdqchihTG-IsjytDCo6s_FQRAaw1&t=637152258930000000',
            HOVER: 'WebResource.axd?d=Wuvq32UcawXXaM6tuTrXn5rg_Z7_sniLwYwveiaUo9b49-aoMAv9gZ_nADsLILOzcX6KRmw_W2do3ggItxVp3QynVqlZvKfZ3MY47dnHebivx4PfRF_6IapgFKtkSV7Ea3ZTRQPtvLAhD-GC5xoVog2&t=637152258930000000',
            DOWN: 'WebResource.axd?d=aC82p1MNEqfXkAOsw29TDkB3Qc3O945XO3VnwBW7oMU1s5QD_JX9XPHQUcs4A3k2gSlYVWyQTA0PxRUkR73_DfV06VUK6Hl4EUlGYw6ZRqYhAopxNo596H2xDsUWIpiI52oIHDP-mVCJn0K4pUlAPNbMraXk75oSleicU1UuCzQ1&t=637152258930000000'
        },
        home: {
            REST: 'WebResource.axd?d=OKTQ3Mkgfyj9Hz_8UiyXWh5cDW0QDAidw3utTV2eprF3_oq0Rh8DuWKqaS3zqH1NByHeaH-xIzI4Mvt3HDqEDraVIT7AT2KCZWqUtDImTSLyM08Y17BCWKtU-JsbtLPZfjZ1P23FBIX7y6D6X_wjHg2&t=637152258930000000',
            GROUP: 'WebResource.axd?d=Yauobcq-vru4ft-wq1GO3VZUp47_Cq1-CYNBKD-dqlgWINjKC6M9HOf44ycw_eB0hkkl01UyjvXoO86XiaWsIqje_0csMIzYMDDh-nUR57VYf3f4ukZHn9OXsOEmJCAJ4dI_bS86UnWe6CYNW1KPpQAp9VWpCs-epihEEcmNtxY1&t=637152258930000000',
            HOVER: 'WebResource.axd?d=9AmOXorKklFAuaq1Stxll_QbEQMQw6sjw-Tfbe1XsNnvBynO_qb0Z5xiKjFpJD13Qzax53rx2DS_L0dTDRh2hTcDGjyXLHqeWQJD-UIQBVT7ghwtl9wvUeReivZgs2sQ-ihIrcg_OFzadjL1t8qp0A2&t=637152258930000000',
            DOWN: 'WebResource.axd?d=iLbBmg2WoW01jr3id_coNV79_-51xuZu-x39o7trrV94DaYyfNHLPTEfzArgUprRZ96k2y5BEa1AGRUDIu1-1jKmOWp12rEDZ8cPz4cxxSeucEjosYNlQr7u_lgA7ELouPQ256g4ASpbb0kw1bpuaA2&t=637152258930000000'
        },
        fullpage: {
            REST: 'WebResource.axd?d=iWZJr9ClovKoJkarn7qLzjEHsHGL-nzKmiSEPRttaAc6csEQJb7FCNMMHoyRDK_PW0XM01WLFZyCzPDzm86SzA5Up2IwT3wFvzygZ3Ikbq1RNV0LpjswmLDm6fogQuVxUAraMLYPnrE56UIvz8VzeQ2&t=637152258930000000',
            GROUP: 'WebResource.axd?d=ngehQP-sgRgBH9_ail9E_jgh8JozP76d42EDADCaghqz79MpJCYCqWHLCg-TQ98lJezMd1EXjZwi6S9AsfQTIvivGUyoOf3c8zkMUrGRAjz1au_0o2BopZU9HFgJBU8_ps34TQSy2XcCJtMWabVletjpD_DU9VAu577aPZqr0_M1&t=637152258930000000',
            HOVER: 'WebResource.axd?d=h0i-CZ9uW8KvGdS-S-BIMbd88XPdC1hUZvWRMiz80vYMujXufAj3dj7lCB_1R6S-t3vQob1kuLRWDQEs_MMt43_bAqcrHYjSlpKuIZ4-r4owboadow6z2tcXk7um-1z4sJmdJLJIb53HTX7TKcgC4Q2&t=637152258930000000',
            DOWN: 'WebResource.axd?d=IEzeq4FAnR0zEDBNF04QXmh8b8B6ePzr90flu0TRns_BplUW_2qyaCcm82OIPBvhHD_UlVVbaD3EGk1BOq5F1f1eNu2Yn59m1xO3xrvbAEsIKVQY9q1Lwi39sbmYSl4p6fHRLOi5p0DQ8mN3TSJQ-AzYz_nuyMJUnqxD7GBiHIk1&t=637152258930000000'
        }
    };
};
Sys.Extended.UI.Seadragon.Config.registerClass('Sys.Extended.UI.Seadragon.Config', null, Sys.IDisposable);
