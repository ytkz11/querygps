/**
 * 坐标转换工具类
 * 移植自Python版本的coord_convert.py
 */

class CoordConverter {
    constructor() {
        this.x_pi = Math.PI * 3000.0 / 180.0;
        this.a = 6378245.0; // 长半轴
        this.ee = 0.00669342162296594323; // 扁率
    }

    /**
     * 火星坐标系(GCJ-02)转百度坐标系(BD-09)
     * 谷歌、高德——>百度
     * @param {number} lng 火星坐标经度
     * @param {number} lat 火星坐标纬度
     * @returns {Array} [bd_lng, bd_lat]
     */
    gcj02ToBd09(lng, lat) {
        const z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * this.x_pi);
        const theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * this.x_pi);
        const bd_lng = z * Math.cos(theta) + 0.0065;
        const bd_lat = z * Math.sin(theta) + 0.006;
        return [bd_lng, bd_lat];
    }

    /**
     * 百度坐标系(BD-09)转火星坐标系(GCJ-02)
     * 百度——>谷歌、高德
     * @param {number} bd_lon 百度坐标经度
     * @param {number} bd_lat 百度坐标纬度
     * @returns {Array} [gg_lng, gg_lat]
     */
    bd09ToGcj02(bd_lon, bd_lat) {
        const x = bd_lon - 0.0065;
        const y = bd_lat - 0.006;
        const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * this.x_pi);
        const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * this.x_pi);
        const gg_lng = z * Math.cos(theta);
        const gg_lat = z * Math.sin(theta);
        return [gg_lng, gg_lat];
    }

    /**
     * WGS84转GCJ02(火星坐标系)
     * @param {number} lng WGS84坐标系的经度
     * @param {number} lat WGS84坐标系的纬度
     * @returns {Array} [mglng, mglat]
     */
    wgs84ToGcj02(lng, lat) {
        if (this.outOfChina(lng, lat)) {
            return [lng, lat];
        }
        let dlat = this._transformLat(lng - 105.0, lat - 35.0);
        let dlng = this._transformLng(lng - 105.0, lat - 35.0);
        const radlat = lat / 180.0 * Math.PI;
        let magic = Math.sin(radlat);
        magic = 1 - this.ee * magic * magic;
        const sqrtmagic = Math.sqrt(magic);
        dlat = (dlat * 180.0) / ((this.a * (1 - this.ee)) / (magic * sqrtmagic) * Math.PI);
        dlng = (dlng * 180.0) / (this.a / sqrtmagic * Math.cos(radlat) * Math.PI);
        const mglat = lat + dlat;
        const mglng = lng + dlng;
        return [mglng, mglat];
    }

    /**
     * GCJ02(火星坐标系)转GPS84
     * @param {number} lng 火星坐标系的经度
     * @param {number} lat 火星坐标系纬度
     * @returns {Array} [lng, lat]
     */
    gcj02ToWgs84(lng, lat) {
        if (this.outOfChina(lng, lat)) {
            return [lng, lat];
        }
        let dlat = this._transformLat(lng - 105.0, lat - 35.0);
        let dlng = this._transformLng(lng - 105.0, lat - 35.0);
        const radlat = lat / 180.0 * Math.PI;
        let magic = Math.sin(radlat);
        magic = 1 - this.ee * magic * magic;
        const sqrtmagic = Math.sqrt(magic);
        dlat = (dlat * 180.0) / ((this.a * (1 - this.ee)) / (magic * sqrtmagic) * Math.PI);
        dlng = (dlng * 180.0) / (this.a / sqrtmagic * Math.cos(radlat) * Math.PI);
        const mglat = lat + dlat;
        const mglng = lng + dlng;
        return [lng * 2 - mglng, lat * 2 - mglat];
    }

    /**
     * 百度坐标系转WGS84
     * @param {number} bd_lon 百度坐标经度
     * @param {number} bd_lat 百度坐标纬度
     * @returns {Array} [lng, lat]
     */
    bd09ToWgs84(bd_lon, bd_lat) {
        const [lon, lat] = this.bd09ToGcj02(bd_lon, bd_lat);
        return this.gcj02ToWgs84(lon, lat);
    }

    /**
     * WGS84转百度坐标系
     * @param {number} lon WGS84经度
     * @param {number} lat WGS84纬度
     * @returns {Array} [bd_lng, bd_lat]
     */
    wgs84ToBd09(lon, lat) {
        const [lng, lat_] = this.wgs84ToGcj02(lon, lat);
        return this.gcj02ToBd09(lng, lat_);
    }

    /**
     * 纬度转换辅助函数
     * @private
     */
    _transformLat(lng, lat) {
        let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat +
                  0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
        const sin_lng_pi = Math.sin(6.0 * lng * Math.PI);
        const sin_2_lng_pi = Math.sin(2.0 * lng * Math.PI);
        const sin_lat_pi = Math.sin(lat * Math.PI);
        const sin_lat_3_pi = Math.sin(lat / 3.0 * Math.PI);
        const sin_lat_12_pi = Math.sin(lat / 12.0 * Math.PI);
        const sin_lat_30_pi = Math.sin(lat * Math.PI / 30.0);
        ret += (20.0 * sin_lng_pi + 20.0 * sin_2_lng_pi) * 2.0 / 3.0;
        ret += (20.0 * sin_lat_pi + 40.0 * sin_lat_3_pi) * 2.0 / 3.0;
        ret += (160.0 * sin_lat_12_pi + 320 * sin_lat_30_pi) * 2.0 / 3.0;
        return ret;
    }

    /**
     * 经度转换辅助函数
     * @private
     */
    _transformLng(lng, lat) {
        let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng +
                  0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
        ret += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 *
                Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(lng * Math.PI) + 40.0 *
                Math.sin(lng / 3.0 * Math.PI)) * 2.0 / 3.0;
        ret += (150.0 * Math.sin(lng / 12.0 * Math.PI) + 300.0 *
                Math.sin(lng / 30.0 * Math.PI)) * 2.0 / 3.0;
        return ret;
    }

    /**
     * 判断是否在国内，不在国内不做偏移
     * @param {number} lng 经度
     * @param {number} lat 纬度
     * @returns {boolean} 是否在国外
     */
    outOfChina(lng, lat) {
        return !(lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55);
    }

    /**
     * 批量转换坐标数组
     * @param {Array} coordinates 坐标数组 [[lng, lat], ...]
     * @param {string} fromType 源坐标系类型 ('gcj02', 'bd09', 'wgs84')
     * @param {string} toType 目标坐标系类型 ('gcj02', 'bd09', 'wgs84')
     * @returns {Array} 转换后的坐标数组
     */
    batchConvert(coordinates, fromType, toType) {
        if (fromType === toType) {
            return coordinates;
        }

        const convertMap = {
            'gcj02_bd09': this.gcj02ToBd09.bind(this),
            'bd09_gcj02': this.bd09ToGcj02.bind(this),
            'wgs84_gcj02': this.wgs84ToGcj02.bind(this),
            'gcj02_wgs84': this.gcj02ToWgs84.bind(this),
            'bd09_wgs84': this.bd09ToWgs84.bind(this),
            'wgs84_bd09': this.wgs84ToBd09.bind(this)
        };

        const convertKey = `${fromType}_${toType}`;
        const convertFunc = convertMap[convertKey];

        if (!convertFunc) {
            throw new Error(`不支持的坐标转换: ${fromType} -> ${toType}`);
        }

        return coordinates.map(coord => {
            if (Array.isArray(coord[0])) {
                // 处理多边形坐标
                return coord.map(point => convertFunc(point[0], point[1]));
            } else {
                // 处理单个坐标点
                return convertFunc(coord[0], coord[1]);
            }
        });
    }
}

// 创建全局实例
window.coordConverter = new CoordConverter();

// 导出类（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CoordConverter;
}