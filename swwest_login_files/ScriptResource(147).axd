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
            REST: 'WebResource.axd?d=Ru-6EL3l4EVgWf-CAcvSnirejOC3rRFJr_2MpkofvsHRVA-vt7_XGOXG9OCGVIaDB1eJ-zhjJN_xjBKWExwdOp94AX9zwaARrc_SvI4WBx9BscSgM0fpx2EcYGRnSKNt9F1a5ma5QUxRErpEz5Suqg2&t=637152258930000000',
            GROUP: 'WebResource.axd?d=YDgXy9qiJLT_R7UvKJXkEPtGeVqZBk34z4djcjQDSONy11Rd_2FrjqZTVkoxBlZ9qLCpNsLHe6nylLZDPP42JZxKEL0rdNyzrHsI3j5yTgkhmQieeqWlXRUr6IUw1FINhBRmxqnhBa2hQi7WWW5QTroRGgI0k1CNHL_HKBfKNvY1&t=637152258930000000',
            HOVER: 'WebResource.axd?d=RrY4Fcr_NJyh5LJZxBAKm05o2pMbKEjcu6EAA5taGAM7DNx_TbEAXtBQypZ0Zx84Se2DZT5XZRfQrM6ybEyueT18PK7Whtp8XWYcPgkzC8Q8rdEQYDtXyRzZg8ExPDIe_4oWUVQeje4W93_4-O4Oxg2&t=637152258930000000',
            DOWN: 'WebResource.axd?d=YUnMZwZpk1XxEL45ryZ5HU4LJdB3kz8Kzey3zk5Pmu5kGBKCi6syKNVLpJW01TnmS58c3zoSioaoBmJdq3SsPsI-PJaB9y74FBhieP1zAPN6opDpkEcpr0BPhnHCItTj4szX-q3a5j1X1SlFBQuKWw2&t=637152258930000000'
        },
        zoomOut: {
            REST: 'WebResource.axd?d=3UlXIecKUh6m7wyjNMcrV9olS0COGA9J5zl82vLtIi3h5STXuIHHM4eGkSUOmHTHYEkUHZ4qzgmi7gH6Dyhdkgrn8CRYRaaBGaKokVi57suawilrI6wLJ3q44mUD9qHKEApuKzJRgUGPYgXIga9eeQ2&t=637152258930000000',
            GROUP: 'WebResource.axd?d=EuvTd5C8cGPMvt3QIbtLm9FSvqJ_cnyuiW2VMzDKrsQChoTQK7J660dZ-sKBLLn_-1vqsVHVrwsKul_vUuFvpMmiUTbyN_c54omvQtgTjXCp-GJhTWaVhVlLcbg-QhFwuSEZNmqSOPdnO00ZXirA3XneFgEK4BZOhw-lig-6uG41&t=637152258930000000',
            HOVER: 'WebResource.axd?d=-WWEcsYwfzlxmBjNv6K8bhteZk2WGx9dXD6OUt0SaNPLUNemiyEV3rRriVfWZPkUbIJ_pPgzXqdNBNcbalpu5egjsynucBiX-xSjiwPmcfzMoSCZltqowILckwYqUFh-29jq7NgCmk8WPMK3z-nNug2&t=637152258930000000',
            DOWN: 'WebResource.axd?d=ma-YMT8P510Mk-2A7JycnYNw7NSgTKqRUQxhto3yWCiw02iVr8tML9n0lKe2ZG1vLmfqyU72ZC-3MV-Z_y0hr9o20MDfhnPuvcJnrUWZulJvr8AvFjW-_Je4tRwiG0lItkHQaU5pdVX-D1PJOuRkTqsGEAZicT4DRPex1AkojZs1&t=637152258930000000'
        },
        home: {
            REST: 'WebResource.axd?d=9Iw9o-1z0XauWyp_Y7c66fz4NwqYtgqmPHS9WhRRC2Wfl2bzEk9de9Co-TSOVt9uwe2dBss17LXgs20X8nonTBvyIo0msfBhfZXWF1lafq_Gj7AP6apu2Sv8MpTlE62YuGP2InGlJ9UMFGbFTPqzUw2&t=637152258930000000',
            GROUP: 'WebResource.axd?d=qVIDBbbMdVpCcThdNEDKAfsLkXoCtAo4IayWB7zsduN2gErz--ZK8MeHU3gXFSpX0mwmpt4-Wxn1cOB8IIydYSJ90kFCtgYSvLupT5ayFSNIRdqTWC9Qbk9Jtcj7Afzx47J92ri0LVWr1LrWEhNizb0EZY-BMLCIA5LL37svoRk1&t=637152258930000000',
            HOVER: 'WebResource.axd?d=-jIyFp65KtQAcdkPOcx0oN9sYtWoUcdVqcxkYX-QtKXAf__oFlSHlMHbZSmpGH0Yoyv3b1BV8c9iHbGUKNTrCC-v1cMPc_6Tce4yzG0-Xyk08y__VlQsvPzQBJSdoebNCb4l9ARVOFjvpiXbMIk5VA2&t=637152258930000000',
            DOWN: 'WebResource.axd?d=PNeLkPrQXDRwpKeeFmaN0MvlZRii9az6IzE9I4R9SN3sl8raDGllZjjF2AbkrWoPux-j0SH6gxe85i_UY_5tyCyCBugkJkNFIIqADGdyF9y9oHzTNVPnMzL6lsYQlkXdvMgUcqOkxzw7kXVBDenkfw2&t=637152258930000000'
        },
        fullpage: {
            REST: 'WebResource.axd?d=x538Fwivl3skojtXLgk87tzjMAflpzTpx7VN94t6uHxuiqFnKOd5vEAz8ojxfqKylSkpYFV7wOhPDjdLDIUF-YuFjF96uCKE4ZW4wMASxo-7YVq4VZqZU9BDPFtZyK4ZI9aKCu9-oX63PVr6QKZ-0Q2&t=637152258930000000',
            GROUP: 'WebResource.axd?d=S42rNc3xLayBtRwxWwxJrtpEb4_68v1uLWc_pABm7W4cSdwf7elA7wtYxs25LZNCxNXZzixRJZFvOQqKj6W_iUlaLQ6BKAf_BqswyHROaLOmSjy9QUg60zBNGSEIDmsJBURrOvG911NnMOptHzeKDul7gOg_po8p5yDUGkD3FjE1&t=637152258930000000',
            HOVER: 'WebResource.axd?d=-cJNM-FsezdJz1nQ72957lZCainglTW0Xr30z8hmY4ftW3dD5cgDHrFfjvshjHOcIq34VDrFJP6TH_f52hinF7o_y3nJhukwuXVhas6Z_aRh6lBNLcNm9QPwk3hG3qaQna_xjCF16KEjAYBRms5D_g2&t=637152258930000000',
            DOWN: 'WebResource.axd?d=ZV3p6fhpnrFtzXAaL9LDckzVyyjie0aDWSvaD-P_WinjL7PtAyk4Jc8qW1l2vIgIt7rCCQHNECEtLuDqqbtAg_aWHX9NRrkGb3XN2nyGFDQbO_HdHtAVcOBv7tQaqjgMOyi2MrgZxgQ8JsD34dQqjxakOdoz81UEupxTqivRCHY1&t=637152258930000000'
        }
    };
};
Sys.Extended.UI.Seadragon.Config.registerClass('Sys.Extended.UI.Seadragon.Config', null, Sys.IDisposable);
