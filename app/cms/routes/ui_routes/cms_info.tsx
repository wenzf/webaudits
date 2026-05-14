export default function CMSInfo() {
    return (

        <div className="max-w-screen m-auto px-12">
            <table className="table_1 style_1 mt-8 table-auto" width={"100%"}>
                <caption>Data structure</caption>
                <thead>
                    <tr>
                        <th rowSpan={3} colSpan={2}>Data type</th>
                        <th rowSpan={3}>Note</th>
                        <th colSpan={5} >DB Keys</th>
                    </tr>
                    <tr>
                        <th colSpan={3}>PK</th>
                        <th colSpan={2} rowSpan={1}>SK</th>
                    </tr>
                    <tr>
                        <th>sub_1</th>
                        <th>sub_2</th>
                        <th>Ex.</th>
                        <th>Type</th>
                        <th>Ex. / Value</th>

                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td rowSpan={2} colSpan={1}>Pages</td>
                        <td rowSpan={1} colSpan={1}>Page Static</td>
                        <td colSpan={1}></td>
                        <td colSpan={1}><code>PS</code></td>
                        <td colSpan={1}><code>en</code> | <code>de</code> *</td>
                        <td colSpan={1}><code>PS#de</code></td>
                        <td colSpan={1}><code>enum</code> | <code>{"<slug>"} </code></td>
                        <td colSpan={1}><code>main</code></td>
                    </tr>
                    <tr>
                        <td colSpan={1}>Blog Post</td>
                        <td colSpan={1}></td>
                        <td colSpan={1}><code>BP</code></td>
                        <td colSpan={1}><code>en</code> | <code>de</code> *</td>
                        <td colSpan={1}><code>BP#en</code></td>
                        <td colSpan={1}><code>{"<slug>"} </code></td>
                        <td colSpan={1}><code>url-slug-of-post</code></td>
                    </tr>
                    <tr>
                        <td rowSpan={1} colSpan={1}>Aside</td>
                        <td rowSpan={1} colSpan={1}>Post aside / popular posts</td>
                        <td colSpan={1}></td>
                        <td colSpan={1}><code>BA</code></td>
                        <td colSpan={1}><code>en</code> | <code>de</code> *</td>
                        <td colSpan={1}><code>BA#en</code></td>
                        <td colSpan={1}><code>enum</code></td>
                        <td colSpan={1}><code>main</code></td>
                    </tr>
                                        <tr>
                        <td rowSpan={1} colSpan={1}>CMS</td>
                        <td rowSpan={1} colSpan={1}>Internal notes</td>
                        <td colSpan={1}></td>
                        <td colSpan={1}><code>IN</code></td>
                        <td colSpan={1}><code>notes</code></td>
                        <td colSpan={1}><code>IN#notes</code></td>
                        <td colSpan={1}><code>{"<slug>"}</code></td>
                        <td colSpan={1}><code>note-1</code></td>
                    </tr>


                    {/** 
                    <tr>
                        <td colSpan={1}>Work / Coding main</td>
                        <td colSpan={1}></td>
                        <td colSpan={1}><code>PW</code></td>
                        <td colSpan={1}><code>de|en</code> *</td>
                        <td colSpan={1}><code>PW#de</code></td>
                        <td colSpan={1}><code>enum</code></td>
                        <td colSpan={1}><code>main</code></td>
                    </tr>
                                        <tr>
                        <td colSpan={1}>Showcaess main</td>
                        <td colSpan={1}></td>
                        <td colSpan={1}><code>PF</code></td>
                        <td colSpan={1}><code>de|en</code> *</td>
                        <td colSpan={1}><code>PF#de</code></td>
                        <td colSpan={1}><code>enum</code></td>
                        <td colSpan={1}><code>main</code></td>
                    </tr>
                    <tr>
                        <td colSpan={1}>Showcsaes Item</td>
                        <td colSpan={1}></td>
                        <td colSpan={1}><code>PS</code></td>
                        <td colSpan={1}><code>de|en</code> *</td>
                        <td colSpan={1}><code>PS#de</code></td>
                        <td colSpan={1}><code>{"<slug>"}</code></td>
                        <td colSpan={1}><code>url-slug-of-page</code></td>
                    </tr>
                    */}
                    <tr>
                        <td rowSpan={5} colSpan={1}>Media Files</td>
                        <td rowSpan={1} colSpan={1}>Bild</td>
                        <td colSpan={1}>jpg, png, svg</td>
                        <td colSpan={1} rowSpan={3}><code>ME</code></td>
                        <td colSpan={1}><code>IM</code></td>
                        <td colSpan={1}><code>ME#IM</code></td>
                        <td colSpan={1}><code>string</code> **</td>
                        <td colSpan={1}><code>mcoqebyz</code></td>
                    </tr>
                    <tr>
                        <td colSpan={1}>Video</td>
                        <td colSpan={1}>mp4, webm</td>
                        <td colSpan={1}><code>VI</code></td>
                        <td colSpan={1}><code>ME#VI</code></td>
                        <td colSpan={1}><code>string</code> **</td>
                        <td colSpan={1}><code>mcoqebyz</code></td>
                    </tr>
                    <tr>
                        <td colSpan={1}>Documents</td>
                        <td colSpan={1}>pdf</td>

                        <td colSpan={1}><code>DO</code></td>
                        <td colSpan={1}><code>ME#DO</code></td>
                        <td colSpan={1}><code>string</code> **</td>
                        <td colSpan={1}><code>mcoqebyz</code></td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td rowSpan={2} />
                        <td colSpan={7}>* Alpha-2 Language Code</td>
                    </tr>
                    <tr>
                        <td colSpan={7}>** UNIX Expoche Time Base 32</td>
                    </tr>
                </tfoot>
            </table>
            <br />
            <br />
            <br />
            <br />

        </div>
    )
}